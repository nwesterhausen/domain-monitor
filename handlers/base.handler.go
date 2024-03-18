package handlers

import (
	"github.com/labstack/echo/v4"
	"nwest.one/domain-monitor/views/layout"
)

func HandlerShowBase(c echo.Context) error {
	return View(c, layout.Base())
}
