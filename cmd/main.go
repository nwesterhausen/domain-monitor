package main

import (
	"fmt"
	"log"
	"time"

	"github.com/nwesterhausen/domain-monitor/configuration"
	"github.com/nwesterhausen/domain-monitor/handlers"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	log.Println("Loading configuration and cache files...")

	config := configuration.ReadAppConfig()

	if config.Alerts.SendAlerts {
		if !config.SMTP.Enabled {
			log.Println("Email notifications are disabled")
		} else if len(config.SMTP.Host) == 0 || config.SMTP.Host == "smtp.example.com" {
			log.Println("SMTP is not configured")
			config.SMTP.Enabled = false
		} else {
			log.Printf("Alerts configured to be sent to %s", config.Alerts.Admin)
		}
	} else {
		log.Println("Alerts are disabled")
	}
	log.Printf("WHOIS cache refresh interval set to %d hours", config.App.WhoisRefreshInterval)

	domains := configuration.ReadDomains()
	log.Printf("Loaded %d domains from domain list", len(domains.Domains))

	whoisCache := configuration.ReadWhoisCache()
	log.Printf("Found %d cached whois entries", len(whoisCache.Entries))

	app := echo.New()

	app.HTTPErrorHandler = handlers.CustomHTTPErrorHandler

	app.Static("/", "assets")
	app.Use(middleware.Logger())

	handlers.SetupRoutes(app)
	handlers.SetupConfigRoutes(app, config)
	handlers.SetupDomainRoutes(app, domains)

	// Connect scheduler for whois cache updates. First delay is after 5 seconds, then every (configured amount) of hours
	// Does not automatically update the interval if the config changes, so a server reset is required to change the interval
	time.AfterFunc(5*time.Second, func() {
		if config.App.WhoisRefreshInterval == 0 {
			log.Println("🚫 WHOIS cache refresh is disabled by configuration. (Check `whoisRefreshInterval` in config.yaml)")
			return
		}

		whoisRefreshOnSchedule(whoisCache, domains, config.App.WhoisRefreshInterval)
		log.Printf("📆 Refreshing WHOIS cache every %d hours", config.App.WhoisRefreshInterval)
	})

	// Start server on configured port
	app.Logger.Fatal(app.Start("localhost:" + fmt.Sprint(config.App.Port)))
}

// Refresh the whois cache on a schedule, and flush the cache. This runs every 6 hours.
func whoisRefreshOnSchedule(whoisCache configuration.WhoisCacheStorage, domains configuration.DomainConfiguration, hourInterval int) {
	log.Println("🔄 Refreshing WHOIS cache")
	whoisCache.RefreshWithDomains(domains)
	whoisCache.Flush()
	time.AfterFunc(time.Hour*time.Duration(hourInterval), func() { whoisRefreshOnSchedule(whoisCache, domains, hourInterval) })
}
