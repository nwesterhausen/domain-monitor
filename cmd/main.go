package main

import (
	"nwest.one/domain-monitor/configuration"
	"nwest.one/domain-monitor/handlers"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	config := configuration.ReadAppConfig()

	app := echo.New()

	app.HTTPErrorHandler = handlers.CustomHTTPErrorHandler

	app.Static("/", "assets")
	app.Use(middleware.Logger())

	handlers.SetupRoutes(app)

	// Start server on configured port
	app.Logger.Fatal(app.Start("localhost:" + string(config.App.Port)))
}
