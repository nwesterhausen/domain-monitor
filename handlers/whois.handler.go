package handlers

import (
	"errors"

	"github.com/a-h/templ"
	"github.com/labstack/echo/v4"
	"github.com/nwesterhausen/domain-monitor/service"
	"github.com/nwesterhausen/domain-monitor/views/domains"
)

type WhoisHandler struct {
	WhoisService *service.ServicesWhois
}

func NewWhoisHandler(ws *service.ServicesWhois) *WhoisHandler {
	return &WhoisHandler{
		WhoisService: ws,
	}
}

// Get the inner card HTML content for a domain's whois information
func (h *WhoisHandler) GetCard(c echo.Context) error {
	fqdn := c.FormValue("fqdn")
	if len(fqdn) == 0 {
		return errors.New("invalid domain to fetch (FQDN required)")
	}

	var card templ.Component
	whois, err := h.WhoisService.GetWhois(fqdn)

	if err != nil {
		card = domains.WhoisError(err)
	} else {
	card = domains.WhoisDetail(whois)
	}

	return View(c, card)
}
