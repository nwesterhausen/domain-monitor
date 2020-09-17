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
})