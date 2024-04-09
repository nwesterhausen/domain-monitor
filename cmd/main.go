package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/nwesterhausen/domain-monitor/configuration"
	"github.com/nwesterhausen/domain-monitor/handlers"
	"github.com/nwesterhausen/domain-monitor/service"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// setup the data directory which is passed in via a program argument
	dataDirectory := flag.String("data-dir", "./data", "Directory to store configuration and cache files")
	flag.Parse()

	// output the data directory to log and validate it
	log.Println("📁 Data directory set to", *dataDirectory)
	validateDirectory(*dataDirectory)

	// setup the configuration directory
	configDirectory := configuration.ConfigDirectory{DataDir: *dataDirectory}

	log.Println("⤴️ Loading configuration and cache files...")

	// read the app configuration
	config := configDirectory.ReadAppConfig()
	// configure the SMTP mailer
	var _mailer *service.MailerService = nil
	// provide some sanity log messages, to confirm the alert and mailer settings
	if config.Config.Alerts.SendAlerts {
		if !config.Config.SMTP.Enabled {
			log.Println("❌ Email notifications are disabled")
		} else if len(config.Config.SMTP.Host) == 0 || config.Config.SMTP.Host == "smtp.example.com" {
			log.Println("❌ SMTP is not configured")
			config.Config.SMTP.Enabled = false
		} else {
			_mailer = service.NewMailerService(config.Config.SMTP)
			log.Printf("📧 Alerts configured to be sent to %s", config.Config.Alerts.Admin)
		}
	} else {
		log.Println("📵 Alerts are disabled")
	}
	// for sanity, log the cache refresh interval parsed from the configuration
	log.Printf("📆 WHOIS cache refresh interval set to %s", configuration.WhoisRefreshInterval)

	// read the domain configuration
	domains := configDirectory.ReadDomains()
	log.Printf("📄 Loaded %d domains from domain list", len(domains.DomainFile.Domains))

	// read the WHOIS cache
	whoisCache := configDirectory.ReadWhoisCache()
	log.Printf("📄 Found %d cached whois entries", len(whoisCache.FileContents.Entries))

	// initialize the web server
	app := echo.New()

	// tell it we will provide custom error pages
	app.HTTPErrorHandler = handlers.CustomHTTPErrorHandler

	// tell it about the static asset directories
	app.Static("/", "assets")
	// use the logger middleware
	app.Use(middleware.Logger())

	// set up our routes
	handlers.SetupRoutes(app)
	handlers.SetupConfigRoutes(app, config)
	handlers.SetupDomainRoutes(app, domains)

	// if the mailer was configured, add the routes
	if _mailer != nil {
		handlers.SetupMailerRoutes(app, _mailer, config.Config.Alerts.Admin)
	}

	// Setup whois routes
	_whoisService := service.NewWhoisService(whoisCache)
	handlers.SetupWhoisRoutes(app, _whoisService)

	// Connect scheduler for whois cache updates. First delay is after 5 seconds, then every (configured amount) of hours
	// Does not automatically update the interval if the config changes, so a server reset is required to change the interval
	time.AfterFunc(5*time.Second, func() {
		if !config.Config.App.AutomateWHOISRefresh {
			log.Println("🚫 WHOIS cache refresh is disabled by configuration. (Check `automateWHOISRefresh` in config.yaml)")
			return
		}

		whoisRefreshOnSchedule(whoisCache, domains, configuration.WhoisRefreshInterval)
		log.Printf("📆 Scheduler running WHOIS expiration checks every %s", configuration.WhoisRefreshInterval)
	})

	// Connect scheduler for domain expiration checks. First delay is after 60 seconds, then every (configured amount) of hours
	// Does not automatically update the interval if the config changes, so a server reset is required to change the interval
	// This uses the WhoisRefreshInterval as the interval for the domain expiration checks
	time.AfterFunc(60*time.Second, func() {
		domainExpirationCheckOnSchedule(whoisCache, domains, _mailer, config.Config, configuration.WhoisRefreshInterval)
		log.Printf("📆 Scheduler running domain expiration checks every %s", configuration.WhoisRefreshInterval)
	})

	// Start server on configured port
	app.Logger.Fatal(app.Start(":" + fmt.Sprint(config.Config.App.Port)))
}

// When called on schedule, check for domain expirations in the WHOIS cache and send mail
func domainExpirationCheckOnSchedule(whoisCache configuration.WhoisCacheStorage, domains configuration.DomainConfiguration, mailer *service.MailerService, appConfig configuration.ConfigurationFile, interval time.Duration) {
	if mailer == nil {
		log.Println("🚫 No mailer configured, canceling domain expiration checks.")
		return
	}

	// for every domain in the domains configuration, if alerts are turned on, check the expiration from the WHOIS cache and then send an alert if one hasn't been sent.
	for _, domain := range domains.DomainFile.Domains {
		if domain.Alerts {
			whoisEntry := whoisCache.Get(domain.FQDN)
			if whoisEntry == nil {
				log.Printf("❌ WHOIS entry for %s not found, skipping", domain.FQDN)
				continue
			}

			// Get the days until expiration
			daysUntilExpiration := whoisEntry.WhoisInfo.Domain.ExpirationDateInTime.Sub(time.Now()).Hours() / 24

			// Check the 2-month, 1-month, 2-week, 1-week, 3-day and within 1 week of expiration thresholds
			if daysUntilExpiration <= 60 && !whoisEntry.Sent2MonthAlert && appConfig.Alerts.Send2MonthAlert {
				if err := mailer.SendAlert(appConfig.Alerts.Admin, domain.FQDN, configuration.Alert2Months); err != nil {
					log.Printf("❌ Failed to send 2-month alert for %s: %s", domain.FQDN, err)
					continue
				}
				whoisEntry.MarkAlertSent(configuration.Alert2Months)
			}
			if daysUntilExpiration <= 30 && !whoisEntry.Sent1MonthAlert && appConfig.Alerts.Send1MonthAlert {
				if err := mailer.SendAlert(appConfig.Alerts.Admin, domain.FQDN, configuration.Alert1Month); err != nil {
					log.Printf("❌ Failed to send 1-month alert for %s: %s", domain.FQDN, err)
					continue
				}
				whoisEntry.MarkAlertSent(configuration.Alert1Month)
			}
			if daysUntilExpiration <= 14 && !whoisEntry.Sent2WeekAlert && appConfig.Alerts.Send2WeekAlert {
				if err := mailer.SendAlert(appConfig.Alerts.Admin, domain.FQDN, configuration.Alert2Weeks); err != nil {
					log.Printf("❌ Failed to send 2-week alert for %s: %s", domain.FQDN, err)
					continue
				}
				whoisEntry.MarkAlertSent(configuration.Alert2Weeks)
			}
			if daysUntilExpiration <= 7 && !whoisEntry.Sent1WeekAlert && appConfig.Alerts.Send1WeekAlert {
				if err := mailer.SendAlert(appConfig.Alerts.Admin, domain.FQDN, configuration.Alert1Week); err != nil {
					log.Printf("❌ Failed to send 1-week alert for %s: %s", domain.FQDN, err)
					continue
				}
				whoisEntry.MarkAlertSent(configuration.Alert1Week)
			}
			if daysUntilExpiration <= 3 && !whoisEntry.Sent3DayAlert && appConfig.Alerts.Send3DayAlert {
				if err := mailer.SendAlert(appConfig.Alerts.Admin, domain.FQDN, configuration.Alert3Days); err != nil {
					log.Printf("❌ Failed to send 3-day alert for %s: %s", domain.FQDN, err)
					continue
				}
				whoisEntry.MarkAlertSent(configuration.Alert3Days)
			}
			// The daily alerts within one week of expiration need to check the last alert sent date, and confirm that expiration is within 7 days
			if daysUntilExpiration <= 7 && daysUntilExpiration > 0 && appConfig.Alerts.SendDailyExpiryAlert {
				// Check if the last alert sent was on this day, month and year. If it was, don't send another alert.
				if whoisEntry.LastAlertSent.Day() == time.Now().Day() && whoisEntry.LastAlertSent.Month() == time.Now().Month() && whoisEntry.LastAlertSent.Year() == time.Now().Year() {
					log.Printf("⚠️ Daily alert for %s was already sent today", domain.FQDN)
					continue
				}

				if err := mailer.SendAlert(appConfig.Alerts.Admin, domain.FQDN, configuration.AlertDaily); err != nil {
					log.Printf("❌ Failed to send daily alert for %s: %s", domain.FQDN, err)
					continue
				}
				whoisEntry.MarkAlertSent(configuration.AlertDaily)
		}
	}
}

time.AfterFunc(interval, func() { domainExpirationCheckOnSchedule(whoisCache, domains, mailer, appConfig, interval) })
}

// Refresh the whois cache on a schedule, and flush the cache. This runs every 6 hours.
func whoisRefreshOnSchedule(whoisCache configuration.WhoisCacheStorage, domains configuration.DomainConfiguration, interval time.Duration) {
	log.Println("🔄 Refreshing WHOIS cache")
	whoisCache.RefreshWithDomains(domains)
	whoisCache.Flush()

	time.AfterFunc(interval, func() { whoisRefreshOnSchedule(whoisCache, domains, interval) })
}

// Validate a given directory exists, and create it if it doesn't.
func validateDirectory(path string) {
	_, err := os.Stat(path)
	if err == nil {
		log.Println("📂 Data directory exists")
		return
	}
	if os.IsNotExist(err) {
		log.Println("🛠️ Data directory does not exist, creating...")
		err := os.MkdirAll(path, os.ModePerm)
		if err != nil {
			log.Fatalf("❌ Failed to create data directory: %s", err)
			return
		}
		log.Println("📂 Data directory created")
		_, err = os.Stat(path)
		if err == nil {
			log.Println("📂 Data directory exists")
			return
		}
		log.Fatalf("❌ Failed to validate data directory: %s", err)
	}
	log.Fatalf("❌ Failed to validate data directory: %s", err)
}
