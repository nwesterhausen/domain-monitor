const dns = require("dns");

/**
 * Return DNS NS records for domain
 * @param {string} domain
 * @param {function} callback
 */
function getNsForDomain(domain, callback) {
  dns.resolveNs(domain, (err, addresses) => {
    if (err) return callback(err);
    return callback(null, addresses);
  });
}

module.exports = {
  getNsForDomain,
};
