var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');

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
        socket.broadcast.emit('login message',uName + ' logged in')
        conClients.add({id: socket.id, un: uName});
      }
      socket.emit('checkLogin',check)
    });
    socket.on('disconnect', () => {
      conClients.forEach((user) => {
        if (user.id === socket.id) {
          console.log(user.un + ' disconnected!');
          socket.broadcast.emit('login message',user.un + ' logged out')
          conClients.delete(user);
        }
      });
    });
}); 

http.listen(3033, () => {
  console.log('listening on *:3033');
});

function getChat(){
  readstream = fs.createReadStream('test.txt');

}

function saveChat(data){
  let jsonData = JSON.stringify(data);
  fs.writeFile('test.txt',jsonData,function(err){
    if(err){
      console.log(err);
    }
  })
}

