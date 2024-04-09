package service

import (
	"errors"
	"log"

	"github.com/nwesterhausen/domain-monitor/configuration"
)

type ServicesWhois struct {
	store configuration.WhoisCacheStorage
}

func NewWhoisService(store configuration.WhoisCacheStorage) *ServicesWhois {
	return &ServicesWhois{store: store}
}

func (s *ServicesWhois) GetWhois(fqdn string) (configuration.WhoisCache, error) {
	for _, entry := range s.store.FileContents.Entries {
		if entry.FQDN == fqdn {
			return entry, nil
		}
	}
	log.Println("🙅 WHOIS entry cache miss for", fqdn)

	return configuration.WhoisCache{}, errors.New("WHOIS entry not found")
}

func (s *ServicesWhois) MarkAlertSent(fqdn string, alert configuration.Alert) bool {
	for i := range s.store.FileContents.Entries {
		if s.store.FileContents.Entries[i].FQDN == fqdn {
			s.store.FileContents.Entries[i].MarkAlertSent(alert)
			return true
		}
	}
	return false
}
