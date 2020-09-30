const yamler = require("./yamler");

/**
 *
 * @param {object} modifiedDomain
 */
function updateDomainListWithValue(modifiedDomain) {
  yamler.getObjectFromYaml(yamler.DOMAIN_YAML_PATH, (err, domainInfo) => {
    if (err) throw err;
    const domainList = domainInfo.domains;
    let updatedEntry = false;
    for (let i = 0; i < domainList.length; i++) {
      if (domainList[i].fqdn === modifiedDomain.fqdn) {
        console.info(
          `DOMAINS: Matched updated domain to ${domainList[i].fqdn}`
        );
        domainList[i].name = modifiedDomain.name;
        domainList[i].alerts = modifiedDomain.alerts;
        domainList[i].enabled = modifiedDomain.enabled;
        updatedEntry = true;
      }
    }
    if (!updatedEntry) {
      domainList.push(modifiedDomain);
    }
  });
}

module.exports = {
  updateDomainListWithValue,
};
