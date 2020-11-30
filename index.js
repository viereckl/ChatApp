var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var conClients = new Set();
io.on('connection', (socket) => {
    socket.on('chat message', (msg, uName) => {
      //io.emit('chat message', msg, uName); //sending to all clients, include sender
      socket.broadcast.emit('chat message', msg, uName); //sending to all clients except sender
    });
    socket.on('login', (uName) => {
      let check = false
      conClients.forEach((user) => {
        if (user.un === uName) {
          check = true;
        }
      });
      if(check === false){
        console.log(uName + ' logged in');
        conClients.add({id: socket.id, un: uName});
      }
      socket.emit('checkLogin',check)
    });
    socket.on('disconnect', () => {
      conClients.forEach((user) => {
        if (user.id === socket.id) {
          console.log(user.un + ' disconnected!');
          conClients.delete(user);
        }
      });
    });
}); 

http.listen(3033, () => {
  console.log('listening on *:3033');
});

