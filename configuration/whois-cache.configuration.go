package configuration

import (
	"log"
	"os"
	"time"

	"github.com/likexian/whois"
	whoisparser "github.com/likexian/whois-parser"
	"gopkg.in/yaml.v3"
)

type WhoisCache struct {
	// FQDN this entry is for (this is the index used in this app)
	FQDN     string `yaml:"fqdn" json:"fqdn"`
	NxDomain bool   `yaml:"nxdomain" json:"nxdomain"`
	// The WhoisInfo object
	WhoisInfo whoisparser.WhoisInfo `yaml:"whoisInfo" json:"whoisInfo"`
	// Date this entry was last updated
	LastUpdated time.Time `yaml:"lastUpdated" json:"lastUpdated"`
	// Sent the 2 month alert
	Sent2MonthAlert bool `yaml:"sent2MonthAlert" json:"sent2MonthAlert"`
	// Sent the 1 month alert
	Sent1MonthAlert bool `yaml:"sent1MonthAlert" json:"sent1MonthAlert"`
	// Sent the 2 week alert
	Sent2WeekAlert bool `yaml:"sent2WeekAlert" json:"sent2WeekAlert"`
	// Sent the 1 week alert
	Sent1WeekAlert bool `yaml:"sent1WeekAlert" json:"sent1WeekAlert"`
	// Send the 3 day alert
	Sent3DayAlert bool `yaml:"sent3DayAlert" json:"sent3DayAlert"`
	// Date of the last alert sent
	LastAlertSent time.Time `yaml:"lastAlertSent" json:"lastAlertSent"`
}

type WhoisCacheFile struct {
	// The whois cache entries
	Entries []WhoisCache `yaml:"entries" json:"entries"`
}

type WhoisCacheStorage struct {
	// The whois file contents
	FileContents WhoisCacheFile
	// The path to the whois cache file
	Filepath string
}

func DefaultWhoisCacheStorage(path string) WhoisCacheStorage {
	return WhoisCacheStorage{
		FileContents: WhoisCacheFile{},
		Filepath:     path,
	}
}

func (w *WhoisCacheStorage) Get(fqdn string) *WhoisCache {
	// Find the entry
	for i := range w.FileContents.Entries {
		if w.FileContents.Entries[i].FQDN == fqdn {
			return &w.FileContents.Entries[i]
		}
	}

	// If the entry was not found, return nil
	return nil
}

func (w *WhoisCacheStorage) GetAll() []WhoisCache {
	return w.FileContents.Entries
}

func (w *WhoisCacheStorage) Add(fqdn string) {
	// Create a new entry
	newEntry := WhoisCache{
		FQDN:        fqdn,
		WhoisInfo:   whoisparser.WhoisInfo{},
		LastUpdated: time.Time{},
	}

	// Perform the whois query for the new domain
	newEntry.Refresh()

	// Add the entry to the list
	w.FileContents.Entries = append(w.FileContents.Entries, newEntry)
	// Flush the cache to disk
	w.Flush()
}

func (w *WhoisCacheStorage) Refresh() {
	nothingRefreshed := true
	// Only refresh the entries that are expired
	for i := range w.FileContents.Entries {
		if w.FileContents.Entries[i].IsExpired() {
			w.FileContents.Entries[i].Refresh()
			nothingRefreshed = false
		}
	}

	// If nothing was refreshed, log a short message that the cache is up to date
	if nothingRefreshed {
		log.Println("✅ WHOIS cache not reporting any expired entries. Cache is up to date.")
	} else {
		w.Flush()
	}
}

func (w *WhoisCacheStorage) RefreshWithDomains(domains DomainConfiguration) {
	// Make sure we have whois entries for all the domains
	for _, domain := range domains.DomainFile.Domains {
		if w.Get(domain.FQDN) == nil {
			log.Printf("📄 Adding WHOIS entry for %s", domain.FQDN)
			w.Add(domain.FQDN)
		}
	}
	// Refresh the entries
	w.Refresh()
}

func (w *WhoisCacheStorage) Remove(fqdn string) {
	// Find the entry
	for i := range w.FileContents.Entries {
		if w.FileContents.Entries[i].FQDN == fqdn {
			// Remove the entry
			w.FileContents.Entries = append(w.FileContents.Entries[:i], w.FileContents.Entries[i+1:]...)
			log.Printf("🗑 Removed WHOIS entry for %s", fqdn)
			w.Flush()
			return
		}
	}

	w.Flush()
}

func (w *WhoisCache) IsExpired() bool {
	// If the last update was more than 30 days ago, then it's expired
	return time.Since(w.LastUpdated) > 30*24*time.Hour
}

func (w *WhoisCache) Refresh() {
	// Perform the whois query
	whoisRaw, err := whois.Whois(w.FQDN)
	if err != nil {
		log.Printf("Error querying whois for %s: %s", w.FQDN, err)
		return
	}

	// Parse the whois response
	whoisInfo, err := whoisparser.Parse(whoisRaw)
	if err != nil {
		log.Printf("Error parsing whois for %s: %s", w.FQDN, err)
		if err == whoisparser.ErrNotFoundDomain {
			w.NxDomain = true
		}
		return
	}

	// Update the object
	w.WhoisInfo = whoisInfo
	w.LastUpdated = time.Now()

	log.Printf("📄 Refreshed whois for %s", w.FQDN)
}

// Flush the whois cache to its storage
func (w WhoisCacheStorage) Flush() {
	// Write the FileContents to the FilePath
	yaml, yamlerr := yaml.Marshal(w.FileContents)
	if yamlerr != nil {
		log.Println("Error while marshalling WHOIS cache")
		log.Fatalf("error: %v", yamlerr)
	}

	file, err := os.Create(w.Filepath)
	if err != nil {
		log.Println("Error while creating WHOIS cache file")
		log.Fatalf("error: %v", err)
	}

	defer file.Close()

	_, err = file.Write(yaml)
	if err != nil {
		log.Println("Error while writing WHOIS cache file")
		log.Fatalf("error: %v", err)
	}
	// Check if the file has been written
	fileInfo, err := file.Stat()
	if err != nil {
		log.Println("Error while checking WHOIS cache file")
		log.Fatalf("error: %v", err)
	}

	log.Printf("💾 Flushed WHOIS data cache to %s", fileInfo.Name())
}

// Mark an alert as sent, by specifying the Alert type
func (w *WhoisCache) MarkAlertSent(alert Alert) {
	switch alert {
	case Alert2Months:
		// Check if the alert has already been sent, and log the inconsistency
		if w.Sent2MonthAlert {
			log.Printf("⚠️ %s was already marked as sent for %s!", alert, w.FQDN)
		}
		w.Sent2MonthAlert = true
	case Alert1Month:
		// Check if the alert has already been sent, and log the inconsistency
		if w.Sent1MonthAlert {
			log.Printf("⚠️ %s was already marked as sent for %s!", alert, w.FQDN)
		}
		w.Sent1MonthAlert = true
	case Alert2Weeks:
		// Check if the alert has already been sent, and log the inconsistency
		if w.Sent2WeekAlert {
			log.Printf("⚠️ %s was already marked as sent for %s!", alert, w.FQDN)
		}
		w.Sent2WeekAlert = true
	case Alert1Week:
		// Check if the alert has already been sent, and log the inconsistency
		if w.Sent1WeekAlert {
			log.Printf("⚠️ %s was already marked as sent for %s!", alert, w.FQDN)
		}
		w.Sent1WeekAlert = true
	case Alert3Days:
		// Check if the alert has already been sent, and log the inconsistency
		if w.Sent3DayAlert {
			log.Printf("⚠️ %s was already marked as sent for %s!", alert, w.FQDN)
		}
		w.Sent3DayAlert = true
	case AlertDaily:
		// Check if the alert has already been sent, and log the inconsistency
		// We have to check if the date stored is today to know if we sent it already
		if w.LastAlertSent.Day() == time.Now().Day() && w.LastAlertSent.Month() == time.Now().Month() && w.LastAlertSent.Year() == time.Now().Year() {
			log.Printf("⚠️ %s was already marked as sent for %s!", alert, w.FQDN)
		}
	}
	// Update the last alert sent date
	w.LastAlertSent = time.Now()
}
