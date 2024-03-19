package configuration

import (
	"io"
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

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

// The file content of the domain configuration file
type DomainFile struct {
	// List of monitored domains
	Domains []Domain `yaml:"domains" json:"domains"`
}

// The saved domains that are monitored
type DomainConfiguration struct {
	// List of domains
	DomainFile DomainFile
	// Filepath of the domain configuration
	Filepath string
}

func (dc DomainConfiguration) Flush() {
	data, dataErr := yaml.Marshal(dc.DomainFile)
	if dataErr != nil {
		log.Println("Error while marshalling configuration")
		log.Fatalf("error: %v", dataErr)
	}

	file, err := os.Create(dc.Filepath)
	if err != nil {
		log.Println("Error while creating configuration file")
		log.Fatalf("error: %v", err)
	}

	defer file.Close()

	_, err = io.WriteString(file, string(data))
	if err != nil {
		log.Println("Error while writing configuration file")
		log.Fatalf("error: %v", err)
	}

}

// Returns a default domain configuration (empty)
func DefaultDomainConfiguration(filepath string) DomainConfiguration {
	return DomainConfiguration{
		Filepath: filepath,
		DomainFile: DomainFile{
			Domains: []Domain{},
		},
	}
}

// AddDomain adds a domain to the configuration
//
// The domain is added to the list if it doesn't exist (based on FQDN). If it does exist, we update the domain instead.
func (dc *DomainConfiguration) AddDomain(domain Domain) {
	for i, d := range dc.DomainFile.Domains {
		if d.FQDN == domain.FQDN {
			dc.DomainFile.Domains[i] = domain
			return
		}
	}

	dc.DomainFile.Domains = append(dc.DomainFile.Domains, domain)
}

// RemoveDomain removes a domain from the configuration
//
// The domain is identified by its FQDN
func (dc *DomainConfiguration) RemoveDomain(domain Domain) {
	for i, d := range dc.DomainFile.Domains {
		if d.FQDN == domain.FQDN {
			// this creates a new slice with the domain removed (the domain to remove is at index i)
			dc.DomainFile.Domains = append(dc.DomainFile.Domains[:i], dc.DomainFile.Domains[i+1:]...)
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
