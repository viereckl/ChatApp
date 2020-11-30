var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var conClients = new Set();
var uNames = new Set();
io.on('connection', (socket) => {
    conClients.add(socket);

    socket.on('chat message', (msg, uName) => {
      //io.emit('chat message', msg, uName); //sending to all clients, include sender
      socket.broadcast.emit('chat message', msg, uName); //sending to all clients except sender
    });
    socket.on('login', (uName) => {
      let check = false
      if(uNames.has(uName)){
        check = true;
      }else{
        uNames.add(uName);
        console.log(uName + ' logged in');
        console.log(socket.id);
      }
      socket.broadcast.to(socket.id).emit('checkLogin',check)
    });
    socket.on('disconnect', () => {
      console.log(' disconnected');
      conClients.delete(socket);
    });
}); 

http.listen(3033, () => {
  console.log('listening on *:3033');
});

