package handlers

import (
	"errors"

	"github.com/labstack/echo/v4"
	"github.com/nwesterhausen/domain-monitor/views/domains"
)

type DomainHandler struct {
	DomainService ApiDomainService
}

func NewDomainHandler(ds ApiDomainService) *DomainHandler {
	return &DomainHandler{
		DomainService: ds,
	}
}

// Get the HTML for the domain card inner content from 'fqdn' parameter
func (h *DomainHandler) GetCard(c echo.Context) error {
	fqdn := c.Param("fqdn")
	if len(fqdn) == 0 {
		return errors.New("Invalid domain to fetch (FQDN required)")
	}

	domain, err := h.DomainService.GetDomain(fqdn)
	if err != nil {
		return err
	}
	card := domains.DomainCard(domain)
	return View(c, card)
}

// Get the HTML for all the domain cards
func (h *DomainHandler) GetCards(c echo.Context) error {
	domainList, err := h.DomainService.GetDomains()
	if err != nil {
		return err
	}
	cards := domains.DomainCards(domainList)
	return View(c, cards)
}
