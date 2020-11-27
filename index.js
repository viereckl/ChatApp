var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var allClients = [];
io.on('connection', (socket) => {
    allClients.push(socket);

    socket.on('chat message', (msg, uName) => {
      io.emit('chat message', msg, uName);
    });
    socket.on('login', (uName) => {
      console.log(uName + ' logged in');
      console.log(socket.id);
    });
    socket.on('disconnect', () => {
      console.log(' disconnected');
      var i  = allClients.indexOf(socket.id);
      allClients.splice(i,1);
    });
}); 

http.listen(3033, () => {
  console.log('listening on *:3033');
});