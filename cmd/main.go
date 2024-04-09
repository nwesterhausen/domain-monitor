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

	dataDirectory := flag.String("data-dir", "./data", "Directory to store configuration and cache files")
	flag.Parse()

	log.Println("📁 Data directory set to", *dataDirectory)
	validateDirectory(*dataDirectory)

	configDirectory := configuration.ConfigDirectory{DataDir: *dataDirectory}

	log.Println("⤴️ Loading configuration and cache files...")

	config := configDirectory.ReadAppConfig()
	var _mailer *service.MailerService = nil
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
	log.Printf("📆 WHOIS cache refresh interval set to %s", configuration.WhoisRefreshInterval)

	domains := configDirectory.ReadDomains()
	log.Printf("📄 Loaded %d domains from domain list", len(domains.DomainFile.Domains))

	whoisCache := configDirectory.ReadWhoisCache()
	log.Printf("📄 Found %d cached whois entries", len(whoisCache.FileContents.Entries))

	app := echo.New()

	app.HTTPErrorHandler = handlers.CustomHTTPErrorHandler

	app.Static("/", "assets")
	app.Use(middleware.Logger())

	handlers.SetupRoutes(app)
	handlers.SetupConfigRoutes(app, config)
	handlers.SetupDomainRoutes(app, domains)
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
		log.Printf("📆 Refreshing WHOIS cache every %s", configuration.WhoisRefreshInterval)
	})

	// Start server on configured port
	app.Logger.Fatal(app.Start(":" + fmt.Sprint(config.Config.App.Port)))
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
