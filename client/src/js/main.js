const SCK_LOADED_CFG = "101";
const SCK_UPDATE_DOMAIN = "50";
const SCK_DELETE_DOMAIN = "51";
const SCK_UPDATE_CONFIG = "52";
const SCK_SERVER_RESTART = "10";
const SCK_LOADED_DOMAINS = "102";
const SCK_LOADED_WHOIS = "103";
const SCK_WHOIS_CACHE_MISS = "104";

// eslint-disable-next-line no-undef
const socket = io();

// Listeners
socket.on("connect", function () {
  updateMessageGui("Socket Connection Established");
});
socket.on("disconnect", function () {
  updateMessageGui("Connection via socket closed.");
});
socket.on(SCK_SERVER_RESTART, function () {
  updateMessageGui("Server sent server restart message, closing socket!");
  socket.disconnect();
  setTimeout(() => {
    socket.connect();
  }, 8000);
  updateMessageGui("Attempting socket reconnection in 8s.");
});
socket.on(SCK_LOADED_CFG, function (data) {
  updateMessageGui("Configuration data received.", data);
  updateConfigPlaceholders(data);
});
socket.on(SCK_LOADED_DOMAINS, function (data) {
  updateMessageGui("Domain configuration received.", data);
  updateDomainDashboardInformation(data);
  updateDomainConfigurationFeedback(data);
});
socket.on(SCK_LOADED_WHOIS, function (data) {
  updateMessageGui(`WHOIS data recieved for ${data.domain_name}`, data);
  updateDomainCard(data);
});
socket.on(SCK_WHOIS_CACHE_MISS, function (data) {
  updateMessageGui(`WHOIS cache miss for ${data}`);
  document
    .querySelector(`#${getCardIdTagFromDomain(data)} .card-header`)
    .classList.add("bg-warning");
  document.querySelector(
    `#${getCardIdTagFromDomain(data)} .card-body`
  ).innerHTML = `<p>No WHOIS cache for ${data}</p>`;
});

// eslint-disable-next-line no-undef
const DOMAIN_EDIT_MODAL = new bootstrap.Modal(
  document.querySelector("#editDomainModal"),
  {
    backdrop: "static",
  }
);
// eslint-disable-next-line no-undef
const LOG_MESSAGE_MODAL = new bootstrap.Modal(
  document.querySelector("#socketLogModal")
);

// Button defs
document
  .querySelector("#modalDomainBtnCommit")
  .addEventListener("click", updateDomainInfo);
document
  .querySelector("#modalDomainBtnDelete")
  .addEventListener("click", deleteDomainInfo);
document
  .querySelector("#btnShowFullLog")
  .addEventListener("click", function (e) {
    LOG_MESSAGE_MODAL.show();
  });
document
  .querySelector("#btnCommitConfigChanges")
  .addEventListener("click", updateConfig);
document
  .getElementById("btnNewDomain")
  .addEventListener("click", handleNewDomain);

/**
 * Fill in the 'placeholder' attribute on the configuration form with configuration
 * data we get from the server (hopefully live config or something).
 * @param {object} configData config object send from server.
 */
function updateConfigPlaceholders(configData) {
  document
    .querySelector("#webappPort")
    .setAttribute("value", configData.app.port);
  document
    .querySelector("#smtpHost")
    .setAttribute("value", configData.smtp.host);
  document
    .querySelector("#smtpPort")
    .setAttribute("value", configData.smtp.port);
  document
    .querySelector("#smtpUser")
    .setAttribute("value", configData.smtp.auth.user);
  document
    .querySelector("#smtpPass")
    .setAttribute("value", configData.smtp.auth.pass);
  document
    .querySelector("#smtpTarget")
    .setAttribute("value", configData.alerts.admin);
  document
    .querySelector("#enableSmtpCheck")
    .setAttribute("checked", configData.alerts.sendalerts);
  document
    .querySelector("#secureSmtpCheck")
    .setAttribute("checked", configData.smtp.secure);
}

/**
 * React to clicking the 'add domain' button
 */
function handleNewDomain() {
  document.querySelector("#modalDomainTitle").innerText = "Create Domain";
  document.querySelector("#modalDomainBtnDelete").classList.add("d-none");

  DOMAIN_EDIT_MODAL.toggle();
}

/**
 * Update the configurable domains
 * @param {object} domainData
 */
function updateDomainConfigurationFeedback(domainData) {
  const tbody = document.querySelector("#configuredDomainTable tbody");
  tbody.innerHTML = "";
  for (let i = 0; i < domainData.domains.length; i++) {
    tbody.appendChild(buildDomainEntry(domainData.domains[i], i));
  }
}

/**
 * Creates a table row for the domain.
 * @param {object} domainDetails
 *    name: Sample Domain
 *    fqdn: example.com
 *    alerts: on
 *    enabled: on
 * @param {number} index The index in the domain list.
 * @return {Node}
 */
function buildDomainEntry(domainDetails, index) {
  const row = document.createElement("tr");

  // Name Field
  const name = document.createElement("td");
  name.innerText = domainDetails.name;

  // FQDN
  const fqdn = document.createElement("td");
  fqdn.innerText = domainDetails.fqdn;

  // Send Alerts
  const alerts = document.createElement("td");
  alerts.innerHTML = domainDetails.alerts ? "Yes" : "No";

  // Enabled
  const enabled = document.createElement("td");
  console.log(`enabled?${domainDetails.enabled}`);
  enabled.innerHTML = domainDetails.enabled ? "Yes" : "No";

  // Edit
  const edit = document.createElement("td");
  const a = document.createElement("a");
  a.setAttribute("href", "#");
  a.classList.add("btn", "btn-sm");
  a.setAttribute("id", `edit-${index}`);
  a.innerHTML = `<i class="bi bi-pencil-square"></i>`;
  a.addEventListener("click", handleEditRow);
  edit.appendChild(a);

  row.appendChild(name);
  row.appendChild(fqdn);
  row.appendChild(alerts);
  row.appendChild(enabled);
  row.appendChild(edit);

  return row;
}

/**
 * react to clicking the 'edit domain' button
 * @param {Event} e
 */
function handleEditRow(e) {
  let targetId = e.target.id;
  console.log(`Click caught on ${targetId}`);
  if (e.target.tagName !== "A") {
    if (e.target.tagName === "path")
      targetId = e.target.parentElement.parentElement.id;
    else targetId = e.target.parentElement.id;
  }

  const targetRow = document.querySelectorAll(
    "#configuredDomainTable tbody tr"
  );
  const index = targetId.split("-")[1];

  const targetCells = targetRow[index].querySelectorAll("td");
  const domainData = {
    name: targetCells[0].innerText,
    fqdn: targetCells[1].innerText,
    alerts: targetCells[2].innerText === "Yes",
    enabled: targetCells[3].innerText === "Yes",
  };

  document
    .querySelector("#modalDomainName")
    .setAttribute("value", domainData.name);
  document
    .querySelector("#modalDomainFqdn")
    .setAttribute("value", domainData.fqdn);
  document
    .querySelector("#modalDomainAlert")
    .setAttribute("checked", domainData.alerts);
  document
    .querySelector("#modalDomainEnabled")
    .setAttribute("checked", domainData.enabled);
  document.querySelector("#modalDomainTitle").innerText = "Edit Domain";
  document.querySelector("#modalDomainBtnDelete").classList.remove("d-none");

  DOMAIN_EDIT_MODAL.toggle();

  console.log(targetId, domainData);
}

/**
 * Gets the domain information presented in the modal.
 * @return {object}
 */
function getDomainFromModal() {
  return {
    name: document.querySelector("#modalDomainName").value,
    fqdn: document.querySelector("#modalDomainFqdn").value,
    alerts: document.querySelector("#modalDomainAlert").checked,
    enabled: document.querySelector("#modalDomainEnabled").checked,
  };
}

/**
 * Reset the domain update modal to empty values
 */
function resetDomainModalForm() {
  document.querySelector("#modalDomainName").setAttribute("value", "");
  document.querySelector("#modalDomainFqdn").setAttribute("value", "");
  document.querySelector("#modalDomainAlert").setAttribute("checked", false);
  document.querySelector("#modalDomainEnabled").setAttribute("checked", false);
}

/**
 * Send message to a server to update a domain (or create it) from
 * the values in the field
 */
function updateDomainInfo() {
  console.log("Attempting domain update.");
  const domainData = getDomainFromModal();
  socket.emit(SCK_UPDATE_DOMAIN, domainData);
  updateMessageGui(
    `Domain update message sent. (${domainData.fqdn})`,
    domainData
  );
  resetDomainModalForm();
  DOMAIN_EDIT_MODAL.hide();
}

/**
 * Send message to server to delete domain based on what domain is
 * being editted
 */
function deleteDomainInfo() {
  console.log("Attempting domain deletion");
  const domainData = getDomainFromModal();
  socket.emit(SCK_DELETE_DOMAIN, domainData);
  updateMessageGui(
    `Domain deletion message sent. (${domainData.fqdn})`,
    domainData
  );
  resetDomainModalForm();
  DOMAIN_EDIT_MODAL.hide();
}

/**
 * Update the visible log on the web gui
 * @param {string} message
 * @param {*} extraData
 */
function updateMessageGui(message, extraData) {
  const time = new Date().toLocaleString();
  const messageStr = `${time}: ${message}`;
  document.querySelector("#last-message").innerText = messageStr;
  console.log(messageStr);

  if (extraData) console.log(time, extraData);

  const logEntry = document.createElement("li");
  logEntry.classList.add("list-group-item");
  logEntry.innerText = messageStr;
  document.querySelector("#modalLogMessageList").appendChild(logEntry);
}

/**
 * Create a domain info card for the domain object
 * @param {object} domainObj
 * @return {object}
 */
function createDomainCard(domainObj) {
  const card = document.createElement("div");
  card.classList.add("card", "m-2", "col-3");
  card.id = getCardIdTagFromDomain(domainObj.fqdn);

  const header = document.createElement("div");
  header.classList.add("card-header", "h3");
  header.innerText = domainObj.fqdn;

  const body = document.createElement("div");
  body.classList.add("card-body");
  body.innerHTML =
    '<div class="spinner-border text-secondary" role="status">' +
    '<span class="sr-only">Loading...</span></div>' +
    '<span class="ml-2">Waiting for WHOIS update from server</span>';

  card.appendChild(header);
  card.appendChild(body);

  return card;
}

/**
 * Add domain cards or update them on the dashboard
 * @param {object} data
 */
function updateDomainDashboardInformation(data) {
  const dashboard = document.querySelector("#dashContent");
  dashboard.innerHTML = "";
  for (let i = 0; i < data.domains.length; i++) {
    dashboard.appendChild(createDomainCard(data.domains[i]));
  }
}

/**
 * Reads value in config form and sends update to server
 */
function updateConfig() {
  const configObj = {
    app: {
      port: document.querySelector("#webappPort").value,
    },
    smtp: {
      host: document.querySelector("#smtpHost").value,
      port: document.querySelector("#smtpPort").value,
      secure: document.querySelector("#secureSmtpCheck").checked,
      auth: {
        user: document.querySelector("#smtpUser").value,
        pass: document.querySelector("#smtpPass").value,
      },
    },
    alerts: {
      admin: document.querySelector("#smtpTarget").value,
      sendalerts: document.querySelector("#enableSmtpCheck").checked,
    },
  };
  socket.emit(SCK_UPDATE_CONFIG, configObj);
  updateMessageGui("Sent server config update.", configObj);
}

/**
 *
 * @param {object} whoisdata
 */
function updateDomainCard(whoisdata) {
  const cardid = getCardIdTagFromDomain(whoisdata.domain_name);
  let nameserverList = "<ul>";
  for (const ns of whoisdata.name_server) {
    nameserverList += `<li>${ns}</li>`;
  }
  nameserverList += "</ul>";

  document.querySelector(`#${cardid} .card-body`).innerHTML = `<dl>
    <dt>Registrar</dt><dd>${whoisdata.registrar.name}</dd>
    <dt>Registered On</dt><dd>${whoisdata.created_date}</dd>
    <dt>Expiration</dt><dd>${whoisdata.registrar.registration_expiration}</dd>
    <dt>Name Servers</dt><dd>${nameserverList}</dd>
    <dt>WHOIS query time</dt><dd>${whoisdata.whois_db_update_time}</dd>
    </dl>`;
  document.querySelector(`#${cardid} .card-header`).classList.add("bg-success");
}

/**
 * @param {string} fqdn
 * @return {string} domain card idtag
 */
function getCardIdTagFromDomain(fqdn) {
  return `card-${fqdn.replace(/\./g, "-")}`;
}
