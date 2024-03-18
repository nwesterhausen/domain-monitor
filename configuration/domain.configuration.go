package configuration

type Domain struct {
	name    string
	fqdn    string
	alerts  bool
	enabled bool
}

type DomainConfiguration struct {
	domains []Domain
}
