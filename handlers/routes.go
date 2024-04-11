package handlers

import (
	"github.com/a-h/templ"
	"github.com/labstack/echo/v4"
	"github.com/nwesterhausen/domain-monitor/configuration"
	"github.com/nwesterhausen/domain-monitor/service"
)

func SetupRoutes(app *echo.Echo, includeConfiguration bool) {
	bh := &BaseHandler{IncludeConfiguration: includeConfiguration}
	app.GET("/", bh.HandlerShowBase)

	app.GET("/dashboard", HandlerRenderDashboard)
	if includeConfiguration {
		app.GET("/configuration", HandlerRenderConfiguration)
	}
}

func SetupDomainRoutes(app *echo.Echo, domains configuration.DomainConfiguration, configurationEnabled bool) {
	domainHtmx := app.Group("/domain")
	domainApi := app.Group("/api/domain")

	ds := service.NewDomainService(domains)
	dhapi := NewApiDomainHandler(ds)
	dh := NewDomainHandler(ds)

	domainApi.GET("", dhapi.HandleDomainList)
	domainApi.GET("/:fqdn", dhapi.HandleDomainShow)
	if configurationEnabled {
		domainApi.POST("/create", dhapi.HandleDomainCreate)
		domainApi.PUT("/:fqdn", dhapi.HandleDomainUpdate)
		domainApi.DELETE("/:fqdn", dhapi.HandleDomainDelete)
	}

	domainHtmx.GET("/:fqdn/card", dh.GetCard)
	domainHtmx.GET("/cards", dh.GetCards)
	domainHtmx.GET("/tbody", dh.GetListTbody)
	domainHtmx.GET("/edit/:fqdn", dh.GetEditDomain)
	if configurationEnabled {
		domainHtmx.POST("/update", dh.PostUpdateDomain)
		domainHtmx.POST("/new", dh.PostNewDomain)
		domainHtmx.DELETE("/:fqdn", dh.DeleteDomain)
	}
}

func SetupConfigRoutes(app *echo.Echo, config configuration.Configuration) {
	configGroup := app.Group("/config")
	configApi := app.Group("/api/config")

	cs := service.NewConfigurationService(config)
	ch := NewConfigurationHandler(cs)

	configApi.GET("/:section/:key", ch.GetSectionKey)
	if config.Config.App.ShowConfiguration {
		configApi.POST("/:section/:key", ch.SetSectionKey)
	}

	if config.Config.App.ShowConfiguration {
		configGroup.GET("/app", ch.RenderAppConfiguration)
		configGroup.GET("/domain", ch.RenderDomainConfiguration)
		configGroup.GET("/smtp", ch.RenderSmtpConfiguration)
		configGroup.GET("/scheduler", ch.RenderSchedulerConfiguration)
		configGroup.GET("/alerts", ch.RenderAlertsConfiguration)
	}
}

func SetupMailerRoutes(app *echo.Echo, ms *service.MailerService, alertRecipient string) {
	mailerGroup := app.Group("/mailer")

	mh := NewMailerHandler(ms, alertRecipient)

	mailerGroup.POST("/test", mh.HandleTestMail)
}

func SetupWhoisRoutes(app *echo.Echo, ws *service.ServicesWhois) {
	whoisGroup := app.Group("/whois")

	wh := NewWhoisHandler(ws)

	whoisGroup.POST("/", wh.GetCard)
}

func View(c echo.Context, cmp templ.Component) error {
	c.Response().Header().Set(echo.HeaderContentType, echo.MIMETextHTML)

	return cmp.Render(c.Request().Context(), c.Response().Writer)
}
