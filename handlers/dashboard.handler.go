package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/nwesterhausen/domain-monitor/views/dashboard"
)

func HandlerRenderDashboard(c echo.Context) error {
	dashboard := dashboard.Dashboard()

	return View(c, dashboard)
}
