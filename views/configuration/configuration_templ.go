// Code generated by templ - DO NOT EDIT.

// templ: version: v0.2.639
package configuration

//lint:file-ignore SA4006 This context is only used if a nested component is present.

import "github.com/a-h/templ"
import "context"
import "io"
import "bytes"

func Configuration() templ.Component {
	return templ.ComponentFunc(func(ctx context.Context, templ_7745c5c3_W io.Writer) (templ_7745c5c3_Err error) {
		templ_7745c5c3_Buffer, templ_7745c5c3_IsBuffer := templ_7745c5c3_W.(*bytes.Buffer)
		if !templ_7745c5c3_IsBuffer {
			templ_7745c5c3_Buffer = templ.GetBuffer()
			defer templ.ReleaseBuffer(templ_7745c5c3_Buffer)
		}
		ctx = templ.InitializeContext(ctx)
		templ_7745c5c3_Var1 := templ.GetChildren(ctx)
		if templ_7745c5c3_Var1 == nil {
			templ_7745c5c3_Var1 = templ.NopComponent
		}
		ctx = templ.ClearChildren(ctx)
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("<h1>Configuration</h1><p>Changes here are applied to the two config files located in a config dir where you run this server. If you want to modify those files directly, changes will be realized upon restarting the server. Committing changes using this configuration page will cause the server to restart so whatever changes you make take immediate effect.</p><h3>Monitored Domains</h3><p>If you attempt to update a domain and change its FQDN, right now it will just add a new domain entry to watch. In the future, there will be an uuid for each entry.</p><div><a href=\"#\" class=\"btn btn-success\" id=\"btnNewDomain\"><i class=\"bi bi-plus-square\"></i> &nbsp;Add Domain</a></div><table class=\"table\" id=\"configuredDomainTable\"><thead><tr><th scope=\"col\">Name</th><th scope=\"col\">FQDN</th><th scope=\"col\">Send Alert</th><th scope=\"col\">WHOIS Enabled</th><th scope=\"col\"></th></tr></thead> <tbody></tbody></table><div><h3>Web App</h3><div class=\"mb-3\"><label for=\"webappPort\" class=\"form-label\">Listen Port</label> <input type=\"number\" class=\"form-control\" id=\"webappPort\" aria-describedby=\"webappPortHelp\"><div id=\"webappPortHelp\" class=\"form-text\">The port the web app listens to.</div></div><h3>Alerts</h3><div class=\"mb-3\"><label for=\"smtpTarget\" class=\"form-label\">Admin Email</label> <input type=\"email\" class=\"form-control\" id=\"smtpTarget\" aria-describedby=\"smtpHostHelp\"><div id=\"smtpTargetHelp\" class=\"form-text\">The email that alerts should be sent to.</div></div><div class=\"mb-3 form-check\"><input type=\"checkbox\" class=\"form-check-input\" id=\"enableSmtpCheck\"> <label class=\"form-check-label\" for=\"enableSmtpCheck\">Send email on whois changes</label><div id=\"enableSmtpCheckHelp\" class=\"form-text\">If checked, email will be sent when whois information changes.</div></div><h3>SMTP Settings</h3><p>To receive email alerts on whois content changes, these settings need to be correct.</p><div class=\"mb-3\"><label for=\"smtpHost\" class=\"form-label\">Listen Port</label> <input type=\"text\" class=\"form-control\" id=\"smtpHost\" aria-describedby=\"smtpHostHelp\"><div id=\"smtpHostHelp\" class=\"form-text\">The SMTP server hostname.</div></div><div class=\"mb-3\"><label for=\"smtpPort\" class=\"form-label\">Port</label> <input type=\"number\" class=\"form-control\" id=\"smtpPort\" aria-describedby=\"smtpPortHelp\"><div id=\"smtpPortHelp\" class=\"form-text\">The port the SMTP server.</div></div><div class=\"mb-3 form-check\"><input type=\"checkbox\" class=\"form-check-input\" id=\"secureSmtpCheck\"> <label class=\"form-check-label\" for=\"secureSmtpCheck\">Secure</label><div id=\"secureSmtpCheckHelp\" class=\"form-text\">True for 465, false for other ports</div></div><div class=\"mb-3\"><label for=\"smtpUser\" class=\"form-label\">Username</label> <input type=\"text\" class=\"form-control\" id=\"smtpUser\" aria-describedby=\"smtpUserHelp\"><div id=\"smtpUserHelp\" class=\"form-text\">Auth username for SMTP server</div></div><div class=\"mb-3\"><label for=\"smtpPass\" class=\"form-label\">Password</label> <input type=\"password\" class=\"form-control\" id=\"smtpPass\" aria-describedby=\"smtpPassHelp\"><div id=\"smtpPassHelp\" class=\"form-text\">Auth password for SMTP server</div></div><button type=\"button\" id=\"btnCommitConfigChanges\" class=\"btn btn-primary\">Commit Changes</button></div>")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		if !templ_7745c5c3_IsBuffer {
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteTo(templ_7745c5c3_W)
		}
		return templ_7745c5c3_Err
	})
}