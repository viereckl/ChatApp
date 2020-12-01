var fs = require('fs'),
    url = require('url'),
    p = require('path'),
    mimeTypes = {
      "html": "text/html",
      "jpeg": "image/jpeg",
      "jpg": "image/jpeg",
      "png": "image/png",
      "svg": "image/svg+xml",
      "json": "application/json",
      "js": "text/javascript",
      "css": "text/css"
    };

var http = require('http').createServer(function(request, response) {
 
  var uri = url.parse(request.url).pathname, 
      filename = p.join(process.cwd(), uri);
  
  fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.write("404 Not Found\n");
      response.end();
      return;
    }
 
    if (fs.statSync(filename).isDirectory()) 
      filename += '/index.html';
 
    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }
      
      var mimeType = mimeTypes[filename.split('.').pop()];
      
      if (!mimeType) {
        mimeType = 'text/plain';
      }
      
      response.writeHead(200, { "Content-Type": mimeType });
      response.write(file, "binary");
      response.end();
    });
  });
});
var io = require('socket.io')(http);

const path = 'messages.json'
var messages = [];
if(fs.existsSync(path)){
  fs.readFile(path, function read(err,data){
    if (err){
      throw err;
    }
    try{
      messages = JSON.parse(data);
    }catch(exception){
    }
  })
}

var conClients = new Set();
io.on('connection', (socket) => {
    socket.on('chat message', (msg, uName) => {
      socket.broadcast.emit('chat message', msg, uName); 
      addMsg(uName, msg);
    });
    socket.on('login', (uName) => {
      let check = false
      conClients.forEach((user) => {
        if (user.un === uName) {
          check = true;
        }
      });
      socket.emit('checkLogin',check)
      if(check === false){
        let loginStr = uName + ' logged in' 
        console.log(loginStr);
        socket.broadcast.emit('login message',loginStr)
        socket.emit('init msg',messages)
        addMsg('System',loginStr)
        conClients.add({id: socket.id, un: uName});
        let conClientsArr = Array.from(conClients);
        socket.broadcast.emit('onlineUser',conClientsArr); //Übergabe der angemeldeten Benutzer
      }
    });
    socket.on('disconnect', () => closeCon(socket));
    socket.on('error', () => closeCon(socket));
}); 

function closeCon(socket){
  let logoutStr = '';
  return conClients.forEach((user) => {
    if (user.id === socket.id) {
      logoutStr = user.un + ' logged out!'
      console.log(logoutStr);
      socket.broadcast.emit('login message',logoutStr)
      addMsg('System',logoutStr)
      conClients.delete(user);
      let conClientsArr = Array.from(conClients);
      socket.broadcast.emit('onlineUser',conClientsArr); //Übergabe der angemeldeten Benutzer
    }
  });
}

http.listen(3033, () => {
  console.log('listening on *:3033');
});

function addMsg(pUsername, pMsg){
  messages.push({
    username: pUsername,
    message: pMsg
  });
  saveChat(messages);
}

function saveChat(data){
  let jsonData = JSON.stringify(data);
  fs.writeFile('messages.json',jsonData,function(err){
    if(err){
      console.log(err);
    }
  })
}