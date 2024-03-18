package main

import (
	"fmt"
	"log"

	"nwest.one/domain-monitor/configuration"
	"nwest.one/domain-monitor/handlers"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	config := configuration.ReadAppConfig()
	domains := configuration.ReadDomains()
	whoisCache := configuration.ReadWhoisCache()

	log.Printf("Loaded %d domains from domain list", len(domains.Domains))
	log.Printf("Found %d cached whois entries", len(whoisCache.Entries))

	app := echo.New()

	app.HTTPErrorHandler = handlers.CustomHTTPErrorHandler

	app.Static("/", "assets")
	app.Use(middleware.Logger())

	handlers.SetupRoutes(app)
	handlers.SetupConfigRoutes(app, config)
	handlers.SetupDomainRoutes(app, domains)

	// Start server on configured port
	app.Logger.Fatal(app.Start("localhost:" + fmt.Sprint(config.App.Port)))
}
