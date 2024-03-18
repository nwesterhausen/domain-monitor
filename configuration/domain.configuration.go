package configuration

// Domain represents a domain that is monitored
type Domain struct {
	// Display name for the domain
	Name string `yaml:"name" json:"name"`
	// Fully qualified domain name
	FQDN string `yaml:"fqdn" json:"fqdn"`
	// Send alerts for this domain
	Alerts bool `yaml:"alerts" json:"alerts"`
	// Monitoring enabled for this domain
	Enabled bool `yaml:"enabled" json:"enabled"`
}

// The saved domains that are monitored
type DomainConfiguration struct {
	// List of domains
	Domains []Domain `yaml:"domains" json:"domains"`
}

func (dc DomainConfiguration) Flush() {
	WriteDomains(dc)
}

// Returns a default domain configuration (empty)
func DefaultDomainConfiguration() DomainConfiguration {
	return DomainConfiguration{
		Domains: []Domain{},
	}
}

// AddDomain adds a domain to the configuration
//
// The domain is added to the list if it doesn't exist (based on FQDN). If it does exist, we update the domain instead.
func (dc *DomainConfiguration) AddDomain(domain Domain) {
	for i, d := range dc.Domains {
		if d.FQDN == domain.FQDN {
			dc.Domains[i] = domain
			return
		}
	}

	dc.Domains = append(dc.Domains, domain)
}

// RemoveDomain removes a domain from the configuration
//
// The domain is identified by its FQDN
func (dc *DomainConfiguration) RemoveDomain(domain Domain) {
	for i, d := range dc.Domains {
		if d.FQDN == domain.FQDN {
			// this creates a new slice with the domain removed (the domain to remove is at index i)
			dc.Domains = append(dc.Domains[:i], dc.Domains[i+1:]...)
			break
		}
	}
}

// UpdateDomain updates a domain in the configuration
//
// The domain is identified by its FQDN. If the domain doesn't exist, it is added to the list.
func (dc *DomainConfiguration) UpdateDomain(domain Domain) {
	dc.AddDomain(domain)
}
