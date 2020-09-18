let socket = io();

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

/**
 * Fill in the 'placeholder' attribute on the configuration form with configuration
 * data we get from the server (hopefully live config or something).
 * @param configData
 */
function updateConfigPlaceholders(configData) {
    document.querySelector("#webappPort").setAttribute('placeholder', configData.app.port);
    document.querySelector("#smtpHost").setAttribute('placeholder', configData.smtp.host);
    document.querySelector("#smtpPort").setAttribute('placeholder', configData.smtp.port);
    document.querySelector("#secureSmtpCheck").setAttribute('placeholder', configData.smtp.secure);
    document.querySelector("#smtpUser").setAttribute('placeholder', configData.smtp.auth.user);
    document.querySelector("#smtpPass").setAttribute('placeholder', '********');
}