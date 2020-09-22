'use strict';
const nodemailer = require('nodemailer');

const configure = require('./configure');

/**
 * Builds a mailer and sendmail config objects for nodemailer to send mail.
 * @param {string} message HTML Message to send in email.
 * @return {*}
 */
function getMailerConfig(message) {
  let config = {app: {}, smtp: {}, alerts: {admin: ''}};
  configure.getObjectFromYaml(configure.CONFIG_YAML_PATH, (err, data) => {
    if (err) throw err;
    if (data === {}) {
      console.error('Got empty object for config.yaml.');
    }
    config = data;
  });
  config.smtp.logger = true;

  config.sendmail = {
    from: `Domain Monitor <${config.smtp.auth.user}>`, // sender address
    to: config.alerts.admin, // list of receivers
    subject: 'Domain Monitor Alert', // Subject line
    text: 'WHOIS change probably...', // plain text body
    html: message, // html body
  };
  return config;
}

/**
 * Sends an email with the specified message to the configured site admin using
 * the smtp settings from config.yaml.
 * @param {string} message HTML message content
 */
function sendAlert(message) {
  // Load SMTP settings
  const CONFIG = getMailerConfig(message);

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport(CONFIG.smtp);

  // verify connection configuration
  transporter.verify(function(error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log('Server is ready to take our messages', success);
      // send mail with defined transport object
      // noinspection JSIgnoredPromiseFromCall
      transporter.sendMail( CONFIG.sendmail, (err, data) => {
        if (err) throw err;
        console.log(
            `MAIL: ${data.messageId} [${data.envelope.from} ->`+
             `${data.envelope.to}] ${data.response}`);
      });
    }
  });
}

module.exports = {
  sendAlert,
};
