package handlers

import (
	"github.com/a-h/templ"
	"github.com/labstack/echo/v4"
	"nwest.one/domain-monitor/configuration"
	"nwest.one/domain-monitor/service"
)

func SetupRoutes(app *echo.Echo) {
	app.GET("/", HandlerShowBase)

	app.GET("/dashboard", HandlerRenderDashboard)
	app.GET("/configuration", HandlerRenderConfiguration)
}

func SetupDomainRoutes(app *echo.Echo, domains configuration.DomainConfiguration) {
	domainGroup := app.Group("/domain")

	ds := service.NewDomainService(domains)
	dh := NewDomainHandler(ds)

	domainGroup.POST("/create", dh.HandleDomainCreate)
	domainGroup.GET("", dh.HandleDomainList)
	domainGroup.GET("/:fqdn", dh.HandleDomainShow)
	domainGroup.PUT("/:fqdn", dh.HandleDomainUpdate)
	domainGroup.DELETE("/:fqdn", dh.HandleDomainDelete)
}

func SetupConfigRoutes(app *echo.Echo, config configuration.Configuration) {
	//	configGroup := app.Group("/config")

	// cs := service.NewConfigService(config)
	// ch := NewConfigHandler(cs)

	// configGroup.GET("/", ch.HandleConfigShow)
	// configGroup.PUT("/", ch.HandleConfigUpdate)
}

func View(c echo.Context, cmp templ.Component) error {
	c.Response().Header().Set(echo.HeaderContentType, echo.MIMETextHTML)

	return cmp.Render(c.Request().Context(), c.Response().Writer)
}
