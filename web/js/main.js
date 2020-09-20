let socket = io();

const EDIT_SVG = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pencil-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">\n' +
    '  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>\n' +
    '  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>\n' +
    '</svg>';

socket.on("connect",function ()  {
    console.log("Connection established via socket.");
});

socket.on("disconnect",function ()  {
    console.log("Connection via socket closed.");
});

socket.on('server restart', function() {
    console.warn("Server sent server restart message, closing socket!");
    socket.disconnect();
    setTimeout(() => {
        socket.connect();
    }, 8000);
    console.log("Attempting socket reconnection in 8s.");
});

socket.on(SCK_LOADED_CFG, function(data) {
    console.log("Configuration data received", data);
    updateConfigPlaceholders(data);
})

socket.on(SCK_LOADED_DOMAINS, function(data) {
    console.log("Domain configuration received", data);
    updateDomainConfigurationFeedback(data);
})

/**
 * Fill in the 'placeholder' attribute on the configuration form with configuration
 * data we get from the server (hopefully live config or something).
 * @param configData config object send from server.
 */
function updateConfigPlaceholders(configData) {
    document.querySelector("#webappPort").setAttribute('placeholder', configData.app.port);
    document.querySelector("#smtpHost").setAttribute('placeholder', configData.smtp.host);
    document.querySelector("#smtpPort").setAttribute('placeholder', configData.smtp.port);
    document.querySelector("#smtpUser").setAttribute('placeholder', configData.smtp.auth.user);
    document.querySelector("#smtpPass").setAttribute('placeholder', '********');
    document.querySelector("#smtpTarget").setAttribute('placeholder', configData.alerts.admin);
    document.querySelector("#enableSmtpCheck").setAttribute('checked', configData.alerts.sendalerts);
    document.querySelector("#secureSmtpCheck").setAttribute('checked', configData.smtp.secure);
}

function updateDomainConfigurationFeedback(domainData) {
    let tbody = document.querySelector('#configuredDomainTable tbody');
    tbody.innerHTML = "";
    for (let i =0; i< domainData.domains.length; i++) {
        tbody.appendChild(buildDomainEntry(domainData.domains[i], i));
    }
}

/**
 * Creates a table row for the domain.
 * @param domainDetails
 *    name: Sample Domain
 *    fqdn: example.com
 *    alerts: on
 * @param index The index in the domain list.
 */
function buildDomainEntry(domainDetails, index) {
    let row = document.createElement('tr');

    // Name Field
    let name = document.createElement('td');
    name.innerText = domainDetails.name;

    // FQDN
    let fqdn = document.createElement('td');
    fqdn.innerText = domainDetails.fqdn;

    // Send Alerts
    let alerts = document.createElement('td');
    alerts.innerHTML = domainDetails.alerts ? "Yes" : "No";

    // Edit
    let edit = document.createElement('td');
    let a = document.createElement('a');
    a.setAttribute('href', '#');
    a.setAttribute('id', `edit-${index}`);
    a.innerHTML = EDIT_SVG;
    a.addEventListener('click', handleEditRow);
    edit.appendChild(a);

    row.appendChild(name);
    row.appendChild(fqdn);
    row.appendChild(alerts);
    row.appendChild(edit);

    return row;
}

function handleEditRow(e) {
    let targetId = e.target.id;
    if (e.target.tagName !== "A") {
        if (e.target.tagName === "path")
            targetId = e.target.parentElement.parentElement.id;
        else
            targetId = e.target.parentElement.id;
    }

    let targetRow = document.querySelectorAll('#configuredDomainTable tbody tr');
    let index = targetId.split('-')[1];

    let targetCells = targetRow[index].querySelectorAll('td');
    let domainData = {
        name: targetCells[0].innerText,
        fqdn: targetCells[1].innerText,
        alerts: targetCells[2].innerText === "Yes"
    }

    console.log(targetId, domainData);
}