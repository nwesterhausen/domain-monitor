package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/nwesterhausen/domain-monitor/views/configuration"
)

func HandlerRenderConfiguration(c echo.Context) error {
	configuration := configuration.Configuration()

	return View(c, configuration)
}
