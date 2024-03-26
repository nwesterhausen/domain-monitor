package handlers

import (
	"errors"
	"fmt"

	"github.com/labstack/echo/v4"
	"github.com/nwesterhausen/domain-monitor/configuration"
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

// Get HTML for domain list as tbody
func (h *DomainHandler) GetListTbody(c echo.Context) error {
	domainList, err := h.DomainService.GetDomains()
	if err != nil {
		return err
	}
	list := domains.DomainListingTbody(domainList)
	return View(c, list)
}

// Add a domain and return an updated tbody
func (h* DomainHandler) PostNewDomain(c echo.Context) error {
	var domain configuration.Domain
	if err := c.Bind(&domain); err != nil {
		return err
	}

	fmt.Printf("Adding domain: %+v\n", domain)

	_, err := h.DomainService.CreateDomain(domain)
	if err != nil {
		return err
	}

	return h.GetListTbody(c)
}

// Delete a domain and return an updated tbody
func (h *DomainHandler) DeleteDomain(c echo.Context) error {
	fqdn := c.Param("fqdn")
	if len(fqdn) == 0 {
		return errors.New("invalid domain to delete (FQDN required)")
	}

	fmt.Printf("Deleting domain: %s\n", fqdn)

	err := h.DomainService.DeleteDomain(fqdn)
	if err != nil {
		return err
	}

	return h.GetListTbody(c)
}

// Get the HTML for the domain edit form
func (h *DomainHandler) GetEditDomain(c echo.Context) error {
	fqdn := c.Param("fqdn")
	if len(fqdn) == 0 {
		return errors.New("invalid domain to edit (FQDN required)")
	}

	domain, err := h.DomainService.GetDomain(fqdn)
	if err != nil {
		return err
	}

	fmt.Printf("Editing domain: %+v\n", domain)

	return View(c, domains.DomainTableRowInput("edit", domain))
}

// Update a domain and return an updated tbody
func (h *DomainHandler) PostUpdateDomain(c echo.Context) error {
	var domain configuration.Domain
	if err := (&echo.DefaultBinder{}).BindBody(c, &domain); err != nil {
		return err
	}

	fmt.Printf("Updating domain: %+v\n", domain)

	err := h.DomainService.UpdateDomain(domain)
	if err != nil {
		return err
	}

	return h.GetListTbody(c)
}
