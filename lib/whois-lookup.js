const whois = require('whois');

const ATTRIBUTE_REGEX = /(^[^:]+): (.*)/;

/**
const WhoisObj_proto = {
    domain_name: "",
    registry: {
        domain_id: "",
        registrant_id: "",
        admin_id: "",
        tech_id: ""
    },
    reseller: "",
    registrar: {
        name: "",
        registration_expiration: "",
        whois: "",
        url: "",
        iana_id: ""
    },
    created_date: "",
    updated_date: "",
    domain_status: [],
    name_server: [],
    dnssec: "",
    registrant: {
        name: "",
        organization: "",
        street: "",
        city: "",
        state_province: "",
        postal_code: "",
        country: "",
        phone: "",
        phone_ext: "",
        fax: "",
        fax_ext: "",
        email: ""
    },
    registrant_admin: {
        name: "",
        organization: "",
        street: "",
        city: "",
        state_province: "",
        postal_code: "",
        country: "",
        phone: "",
        phone_ext: "",
        fax: "",
        fax_ext: "",
        email: ""
    },
    registrant_tech: {
        name: "",
        organization: "",
        street: "",
        city: "",
        state_province: "",
        postal_code: "",
        country: "",
        phone: "",
        phone_ext: "",
        fax: "",
        fax_ext: "",
        email: ""
    }
};
 */

/**
 * Simplifies the whoisdata received from node-whois
 * @param {string} whoisdata
 * @return {object} whoisdata object
 */
function simplifyWhois(whoisdata) {
  const whoisObject = whoisdata.split(/\n/);
  console.info(whoisObject.length, 'entries in whoisdata');
  const simplifiedObject = {
    registry: {},
    registrar: {},
    registrant: {},
    registrant_admin: {},
    registrant_tech: {},
    name_server: [],
    domain_status: [],
    unmatched_data: [],
  };
  for (let i=0; i<whoisObject.length; i++) {
    const matched = whoisObject[i].match(ATTRIBUTE_REGEX);
    if (matched && matched.length > 1) {
      switch (matched[1]) {
        case 'Domain name':
        case 'Domain Name':
          simplifiedObject.domain_name = matched[2];
          break;
        case 'Registry Domain ID':
          simplifiedObject.registry.domain_id = matched[2];
          break;
        case 'Registry Registrant ID':
          simplifiedObject.registry.registrant_id = matched[2];
          break;
        case 'Registry Admin ID':
          simplifiedObject.registry.admin_id = matched[2];
          break;
        case 'Registry Tech ID':
          simplifiedObject.registry.tech_id = matched[2];
          break;
        case 'Registrar WHOIS Server':
          simplifiedObject.registrar.whois = matched[2];
          break;
        case 'Registrar URL':
          simplifiedObject.registrar.url = matched[2];
          break;
        case 'Updated Date':
          simplifiedObject.updated_date = matched[2];
          break;
        case 'Creation Date':
          simplifiedObject.created_date = matched[2];
          break;
        case 'Registrar Registration Expiration Date':
          simplifiedObject.registrar.registration_expiration = matched[2];
          break;
        case 'Registrar':
          simplifiedObject.registrar.name = matched[2];
          break;
        case 'Registrar Abuse Contact Email':
          simplifiedObject.registrar.abuse_email = matched[2];
          break;
        case 'Registrar Abuse Contact Phone':
          simplifiedObject.registrar.abuse_phone = matched[2];
          break;
        case 'Registrar IANA ID':
          simplifiedObject.registrar.iana_id = matched[2];
          break;
        case 'Domain Status':
          simplifiedObject.domain_status.push(matched[2]);
          break;
        case 'Name Server':
          simplifiedObject.name_server.push(matched[2]);
          break;
        case 'Reseller':
          simplifiedObject.reseller = matched[2];
          break;
        case 'Registrant Name':
          simplifiedObject.registrant.name = matched[2];
          break;
        case 'Registrant Organization':
          simplifiedObject.registrant.organization = matched[2];
          break;
        case 'Registrant Street':
          simplifiedObject.registrant.street = matched[2];
          break;
        case 'Registrant City':
          simplifiedObject.registrant.city = matched[2];
          break;
        case 'Registrant State/Province':
          simplifiedObject.registrant.state_province = matched[2];
          break;
        case 'Registrant Postal Code':
          simplifiedObject.registrant.postal_code = matched[2];
          break;
        case 'Registrant Country':
          simplifiedObject.registrant.country = matched[2];
          break;
        case 'Registrant Phone':
          simplifiedObject.registrant.phone = matched[2];
          break;
        case 'Registrant Phone Ext':
          simplifiedObject.registrant.phone_ext = matched[2];
          break;
        case 'Registrant Fax':
          simplifiedObject.registrant.fax = matched[2];
          break;
        case 'Registrant Fax Ext':
          simplifiedObject.registrant.fax_ext = matched[2];
          break;
        case 'Registrant Email':
          simplifiedObject.registrant.email = matched[2];
          break;
        case 'Admin Name':
          simplifiedObject.registrant_admin.name = matched[2];
          break;
        case 'Admin Organization':
          simplifiedObject.registrant_admin.organization = matched[2];
          break;
        case 'Admin Street':
          simplifiedObject.registrant_admin.street = matched[2];
          break;
        case 'Admin City':
          simplifiedObject.registrant_admin.city = matched[2];
          break;
        case 'Admin State/Province':
          simplifiedObject.registrant_admin.state_province = matched[2];
          break;
        case 'Admin Postal Code':
          simplifiedObject.registrant_admin.postal_code = matched[2];
          break;
        case 'Admin Country':
          simplifiedObject.registrant_admin.country = matched[2];
          break;
        case 'Admin Phone':
          simplifiedObject.registrant_admin.phone = matched[2];
          break;
        case 'Admin Phone Ext':
          simplifiedObject.registrant_admin.phone_ext = matched[2];
          break;
        case 'Admin Fax':
          simplifiedObject.registrant_admin.fax = matched[2];
          break;
        case 'Admin Fax Ext':
          simplifiedObject.registrant_admin.fax_ext = matched[2];
          break;
        case 'Admin Email':
          simplifiedObject.registrant_admin.email = matched[2];
          break;
        case 'Tech Name':
          simplifiedObject.registrant_tech.name = matched[2];
          break;
        case 'Tech Organization':
          simplifiedObject.registrant_tech.organization = matched[2];
          break;
        case 'Tech Street':
          simplifiedObject.registrant_tech.street = matched[2];
          break;
        case 'Tech City':
          simplifiedObject.registrant_tech.city = matched[2];
          break;
        case 'Tech State/Province':
          simplifiedObject.registrant_tech.state_province = matched[2];
          break;
        case 'Tech Postal Code':
          simplifiedObject.registrant_tech.postal_code = matched[2];
          break;
        case 'Tech Country':
          simplifiedObject.registrant_tech.country = matched[2];
          break;
        case 'Tech Phone':
          simplifiedObject.registrant_tech.phone = matched[2];
          break;
        case 'Tech Phone Ext':
          simplifiedObject.registrant_tech.phone_ext = matched[2];
          break;
        case 'Tech Fax':
          simplifiedObject.registrant_tech.fax = matched[2];
          break;
        case 'Tech Fax Ext':
          simplifiedObject.registrant_tech.fax_ext = matched[2];
          break;
        case 'Tech Email':
          simplifiedObject.registrant_tech.email = matched[2];
          break;
        case 'DNSSEC':
          simplifiedObject.dnssec = matched[2];
          break;
        case '>>> Last update of WHOIS database':
          simplifiedObject.whois_db_update_time =
              matched[2].match(/^[^< ]+/)[0];
          break;
        case 'URL of the ICANN WHOIS Data Problem Reporting System':
          // Do nothing
          break;
        default:
          simplifiedObject.unmatched_data.push(
              {attribute: matched[1], value: matched[2]}
          );
          break;
      }
    }
  }
  return simplifiedObject;
}

/**
 * Gets the whois data using node-whois, formats it and returns it
 * with the callback.
 * @param {string} domain
 * @param {function} callback
 */
function getWhoisFor(domain, callback) {
  whois.lookup(domain, (err, data) => {
    if (err) return callback(err);
    callback(null, simplifyWhois(data));
  });
}

module.exports = {
  getWhoisFor,
};
