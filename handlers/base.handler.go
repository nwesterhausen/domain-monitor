package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/nwesterhausen/domain-monitor/views/layout"
)

func HandlerShowBase(c echo.Context) error {
	return View(c, layout.Base())
}
