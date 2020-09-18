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

socket.on('101', function(data) {
    console.log("Configuration", data);
    document.querySelector("#webappPort").setAttribute('placeholder', data.app.port);
    document.querySelector("#smtpHost").setAttribute('placeholder', data.smtp.host);
    document.querySelector("#smtpPort").setAttribute('placeholder', data.smtp.port);
    document.querySelector("#secureSmtpCheck").setAttribute('placeholder', data.smtp.secure);
    document.querySelector("#smtpUser").setAttribute('placeholder', data.smtp.auth.user);
    document.querySelector("#smtpPass").setAttribute('placeholder', '*****');
})