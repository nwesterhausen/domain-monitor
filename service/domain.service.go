package service

import (
	"errors"
	"log"

	"github.com/nwesterhausen/domain-monitor/configuration"
)

type ServicesDomain struct {
	store configuration.DomainConfiguration
}

func NewDomainService(store configuration.DomainConfiguration) *ServicesDomain {
	return &ServicesDomain{store: store}
}

func (s *ServicesDomain) CreateDomain(domain configuration.Domain) (int, error) {
	s.store.AddDomain(domain)
	// Return the index of the domain in the list
	for i, d := range s.store.DomainFile.Domains {
		if d.FQDN == domain.FQDN {
			return i, nil
		}
	}
	// This should never happen.. but just in case return -1 and an error
	return -1, errors.New("Failed to add domain")
}

func (s *ServicesDomain) GetDomain(fqdn string) (configuration.Domain, error) {
	for _, d := range s.store.DomainFile.Domains {
		if d.FQDN == fqdn {
			return d, nil
		}
	}
	return configuration.Domain{}, errors.New("Domain not found")
}

func (s *ServicesDomain) GetDomains() ([]configuration.Domain, error) {
	return s.store.DomainFile.Domains, nil
}

func (s *ServicesDomain) UpdateDomain(domain configuration.Domain) error {
	// Log the received domain configuration
	log.Printf("🛰️ Received domain update: %+v\n", domain)

	s.store.UpdateDomain(domain)
	// Return nil to indicate success (we can confirm the domain was updated by checking the list)
	for _, d := range s.store.DomainFile.Domains {
		if d.FQDN == domain.FQDN {
			return nil
		}
	}
	// This should never happen.. but just in case return an error
	return errors.New("Failed to update domain")
}

func (s *ServicesDomain) DeleteDomain(fqdn string) error {
	// Get the domain to pass to RemoveDomain
	for _, d := range s.store.DomainFile.Domains {
		if d.FQDN == fqdn {
			s.store.RemoveDomain(d)
		}
	}
	// Return nil to indicate success (we can confirm the domain was deleted by checking the list)
	for _, d := range s.store.DomainFile.Domains {
		if d.FQDN == fqdn {
			return errors.New("Failed to delete domain")
		}
	}
	return nil
}

func (s *ServicesDomain) Flush() {
	s.store.Flush()
}
