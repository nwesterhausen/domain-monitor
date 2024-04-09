package service

import (
	"fmt"
	"log"

	"github.com/nwesterhausen/domain-monitor/configuration"
	"github.com/wneessen/go-mail"
)

type MailerService struct {
	client *mail.Client
	from   string
}

func NewMailerService(config configuration.SMTPConfiguration) *MailerService {
	var client *mail.Client
	var err error

	// check if SMTP is enabled
	if !config.Enabled {
		log.Println("SMTP is not enabled")
		return nil
	}

	// check if SMTP user and password are set, otherwise use none
	var authStyle = mail.SMTPAuthLogin
	if config.AuthUser == "" || config.AuthPass == "" {
		// auth type None is empty string
		authStyle = ""
	}

	// set security option (force TLS or opportunistic TLS)
	var secureOption = mail.TLSOpportunistic
	if config.Secure {
		secureOption = mail.TLSMandatory
	}

	// create new mail client
	client, err = mail.NewClient(config.Host,
		mail.WithTLSPortPolicy(secureOption),
		mail.WithPort(config.Port),
		mail.WithSMTPAuth(authStyle),
		mail.WithUsername(config.AuthUser),
		mail.WithPassword(config.AuthPass),
	)
	if err != nil {
		log.Printf("failed to create mail client: %s", err)
		return nil
	}

	// combine from name and address
	from := config.FromName + " <" + config.FromAddress + ">"

	return &MailerService{
		client: client,
		from:   from,
	}
}

func (m *MailerService) TestMail(to string) error {
	msg := mail.NewMsg()
	if err := msg.From(m.from); err != nil {
		log.Printf("failed to set FROM address: %s", err)
		return err
	}
	if err := msg.To(to); err != nil {
		log.Printf("failed to set TO address: %s", err)
		return err
	}
	msg.Subject("Test E-Mail from Domain Monitor")
	msg.SetBodyString(mail.TypeTextPlain, "This is a test e-mail from the Domain Monitor application. If you received this, it's working! 🎉")

	if err := m.client.DialAndSend(msg); err != nil {
		log.Printf("failed to deliver mail: %s", err)
		return err
	}
	log.Printf("📧 E-mail message sent to " + to)

	return nil
}

func (m *MailerService) SendAlert(to string, fqdn string, alert configuration.Alert) error {
	msg := mail.NewMsg()
	if err := msg.From(m.from); err != nil {
		log.Printf("❌ failed to set FROM address: %s", err)
		return err
	}
	if err := msg.To(to); err != nil {
		log.Printf("❌ failed to set TO address: %s", err)
		return err
	}
	msg.Subject("Domain Expiration Alert: " + fqdn)

	body := fmt.Sprintf("Your domain %s is expiring in %s. Please renew it as soon as possible.", fqdn, alert)

	msg.SetBodyString(mail.TypeTextPlain, body)

	if err := m.client.DialAndSend(msg); err != nil {
		log.Printf("❌ failed to deliver mail: %s", err)
		return err
	}

	log.Printf("📧 E-mail message sent to " + to)

	return nil
}
