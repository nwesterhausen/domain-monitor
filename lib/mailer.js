"use strict";
const nodemailer = require("nodemailer");

const configure = require('./configure');

function getMailerConfig(message) {
    let config = configure.getConfigObject("config.yaml");
    config.smtp.logger = true;

    config.sendmail = {
        from: `Domain Monitor <${config.smtp.auth.user}>`, // sender address
        to: config.alerts.admin, // list of receivers
        subject: "Domain Monitor Alert", // Subject line
        text: "WHOIS change probably...", // plain text body
        html: message, // html body
    }
    return config;
}

function sendAlert(message) {
    // Load SMTP settings
    const CONFIG = getMailerConfig(message);

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport(CONFIG.smtp);

    // verify connection configuration
    transporter.verify(function (error, success) {
        if (error) {
            console.log(error);
        } else {
            console.log("Server is ready to take our messages");
            // send mail with defined transport object
            transporter.sendMail( CONFIG.sendmail, (err, data) => {
                if (err) throw err;
                console.log(`MAIL: ${data.messageId} [${data.envelope.from} -> ${data.envelope.to}] ${data.response}`);
            });
        }
    });

}

module.exports = {
    sendAlert
}