const SCK_LOADED_CFG = "101";
const SCK_UPDATE_DOMAIN = "50";
const SCK_DELETE_DOMAIN = "51";
const SCK_SERVER_RESTART = "10";
const SCK_LOADED_DOMAINS = "102";

// eslint-disable-next-line no-undef
const socket = io();

const EDIT_SVG =
  '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pencil-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">\n' +
  '  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>\n' +
  '  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>\n' +
  "</svg>";
const ADD_SVG =
  '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-plus-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">\n' +
  '  <path fill-rule="evenodd" d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>\n' +
  '  <path fill-rule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>\n' +
  "</svg>";

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
  const addBtn = document.createElement("A");
  addBtn.setAttribute("href", "#");
  addBtn.classList.add("text-success");
  addBtn.id = "btnNewDomain";
  addBtn.addEventListener("click", handleNewDomain);
  addBtn.innerHTML = ADD_SVG;

  const addRow = document.createElement("tr");
  addRow.innerHTML = "<td></td><td></td><td></td>";
  addRow.appendChild(addBtn);

  tbody.appendChild(addRow);
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
  a.innerHTML = EDIT_SVG;
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
  console.log(targetCells);

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
 * Send message to a server to update a domain (or create it) from
 * the values in the field
 */
function updateDomainInfo() {
  console.log("Attempting domain update.");
  const domainData = {
    name: document.querySelector("#modalDomainName").value,
    fqdn: document.querySelector("#modalDomainFqdn").value,
    alerts: document.querySelector("#modalDomainAlert").checked,
    enabled: document.querySelector("#modalDomainEnabled").checked,
  };
  socket.emit(SCK_UPDATE_DOMAIN, domainData);
  updateMessageGui(
    `Domain update message sent. (${domainData.fqdn})`,
    domainData
  );
  DOMAIN_EDIT_MODAL.hide();
}

/**
 * Send message to server to delete domain based on what domain is
 * being editted
 */
function deleteDomainInfo() {
  console.log("Attempting domain deletion");
  const domainData = {
    name: document.querySelector("#modalDomainName").value,
    fqdn: document.querySelector("#modalDomainFqdn").value,
    alerts: document.querySelector("#modalDomainAlert").checked,
    enabled: document.querySelector("#modalDomainEnabled").checked,
  };
  socket.emit(SCK_DELETE_DOMAIN, domainData);
  updateMessageGui(
    `Domain deletion message sent. (${domainData.fqdn})`,
    domainData
  );
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
  card.classList.add("card", "mb-2");
  card.id = `card-${domainObj.fqdn}`;

  const header = document.createElement("div");
  header.classList.add("card-header");
  header.innerText = domainObj.fqdn;

  const body = document.createElement("div");
  body.classList.add("card-body");
  body.innerHTML = "<p>Here's some sample inner text.</p>";

  card.appendChild(header);
  card.appendChild(body);

  return card;
}

/**
 * Add domain cards or update them on the dashboard
 * @param {object} data
 */
function updateDomainDashboardInformation(data) {
  const dashboard = document.querySelector("#dashboard");
  dashboard.innerHTML = "";
  for (let i = 0; i < data.domains.length; i++) {
    dashboard.appendChild(createDomainCard(data.domains[i]));
  }
}
