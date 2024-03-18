package main

import (
	"nwest.one/domain-monitor/handlers"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	app := echo.New()

	app.HTTPErrorHandler = handlers.CustomHTTPErrorHandler

	app.Static("/", "assets")
	app.Use(middleware.Logger())

	handlers.SetupRoutes(app)

	app.Logger.Fatal(app.Start("localhost:1324"))
}
