package handlers

import (
	"github.com/a-h/templ"
	"github.com/labstack/echo/v4"
)

func SetupRoutes(app *echo.Echo) {
	app.GET("/", HandlerShowBase)

	app.GET("/dashboard", HandlerRenderDashboard)
	app.GET("/configuration", HandlerRenderConfiguration)
}

func View(c echo.Context, cmp templ.Component) error {
	c.Response().Header().Set(echo.HeaderContentType, echo.MIMETextHTML)

	return cmp.Render(c.Request().Context(), c.Response().Writer)
}
