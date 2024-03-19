package mailer

import (
	"log"

	"github.com/wneessen/go-mail"
)


type MailerService struct {
	client *mail.Client
}

func NewMailerService(host string, port int, username string, password string, secure bool) *MailerService {
	var client *mail.Client
	var err error

if secure {
	client, err = mail.NewClient(host, mail.WithPort(port),
	mail.WithUsername(username), mail.WithPassword(password), mail.WithSMTPAuth(mail.SMTPAuthLogin), mail.WithTLSPortPolicy(mail.TLSMandatory))
	if err != nil {
		log.Println("Error encountered while setting up mail client!")
		log.Fatalf("Error: %s", err)
	} } else {
	client, err = mail.NewClient(host, mail.WithPort(port), mail.WithUsername(username), mail.WithPassword(password), mail.WithSMTPAuth(mail.SMTPAuthLogin))
	if err != nil {
		log.Println("Error encountered while setting up mail client!")
		log.Fatalf("Error: %s", err)
	} }

	return &MailerService{
		client: client,
	}
}
