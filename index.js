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
      "css": "text/css",
      "ico": "image/x-icon"
    };

var http = require('http').createServer(function(request, response) { //erstellt HTTP Server
  //requestListener (wird immer aufgerufen wenn der Server eine Anfrage erhält):
  var uri = url.parse(request.url).pathname, //Speichern des Pfadnamens der angefragten URL
      filename = p.join(process.cwd(), uri); //Zusammenfügen des Pfads anhand der CWDs und des URI
      
  if(fs.existsSync(filename)){ //Wenn der filename existiert
    if (fs.statSync(filename).isDirectory()) //wenn filename ein Verzeichnis ist
      filename += '/index.html'; //anhängen von /index.html an den Verzeichnisnamen
 
    fs.readFile(filename, "binary", function(err, file) { //auslesen der Binärdaten der Datei
      if(err) {
        //ausgeben des Fehlers bei Dateieinlesen        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }
      
      var mimeType = mimeTypes[filename.split('.').pop()]; //erkennen des MIME-Typs anhand der Dateiendung
      
      if (!mimeType) { //wenn der MIME-Type nicht existiert wird text/plain dargestellt
        mimeType = 'text/plain';
      }
      
      response.writeHead(200, { "Content-Type": mimeType }); //darstellen des Inhalts anhand des entsprechenden Typs
      response.write(file, "binary"); 
      response.end();
    });
  }else{ //Wenn der filename nicht existiert wird error 404 not found ausgegeben
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.write("404 Not Found\n");
    response.end();
    return;
  }
});

http.listen(3033, () => { //Bestimmen des Ports unter dem der HTTP-Server auf Anfragen wartet
  console.log('listening on *:3033');
});

var io = require('socket.io')(http); //Einbinden von Socket.io mit dem HTTP-Server

const path = 'messages.json'
var messages = [];
if(fs.existsSync(path)){ //Auslesen und speichern von messages.json im messages Array
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

var conClients = new Set(); //Erstellen eines Sets für verbundene Clients

io.on('connection', (socket) => { //Event bei Verbindung eines Clients
    socket.on('chat message', (msg, uColor, uName) => { //Event beim Senden einer Nachricht
      socket.broadcast.emit('chat message', msg, uColor,uName); //Senden einer Nachricht an alle Clients außer Sender
      addMsg(uName, msg); //Speichern der gesendeten Nachricht im Speicher
    });
    socket.on('login', (uName, uColor) => { //Login eines Nutzers
      let check = false;
      conClients.forEach((user) => { //Überprüfen ob der Benutzername schon verwendet wird
        if (user.un === uName) {
          check = true;
        }
      });
      socket.emit('checkLogin',check) //Senden des Rückgabewerts des Logins an den Client
      if(check === false){ //Wenn der Benutzername noch nicht vergeben ist
        let loginStr = uName + ' logged in!' ;
        console.log(loginStr);
        socket.broadcast.emit('login message',loginStr); //Senden der Login Nachricht
        socket.emit('init msg',messages); //Laden aller Nachrichten aus dem Speicher
        addMsg('System',loginStr); //Hinzufügen der Systemnachricht zum Speicher
        conClients.add({id: socket.id, un: uName, color: uColor}); //Hinzufügen des Clients zum Set der verbundenen Clients
        let conClientsArr = Array.from(conClients); //Konvertieren des Sets in ein Array für die Übergabe
        socket.broadcast.emit('onlineUser',conClientsArr); //Übergabe der angemeldeten Benutzer an alle außer Sender
        socket.emit('onlineUser',conClientsArr); //Übergabe der angemeldeten Benutzer an Sender
      }
    });
    socket.on('disconnect', () => closeCon(socket));  //Event bei Schließen der Verbindung (normal)
    socket.on('error', () => closeCon(socket));       //Event bei SChließen der Verbindung (bei Fehlern)
}); 

function closeCon(socket){  //Funktion um Verbindung zu schließen
  let logoutStr = '';
  return conClients.forEach((user) => { //gibt Funktion zurück (Überprüft mit welchem Benutzername der Socket verknüpft war)
    if (user.id === socket.id) {
      logoutStr = user.un + ' logged out!'
      console.log(logoutStr);
      socket.broadcast.emit('login message',logoutStr)
      addMsg('System',logoutStr)
      conClients.delete(user);
      let conClientsArr = Array.from(conClients);
      socket.broadcast.emit('onlineUser',conClientsArr); //Übergabe der angemeldeten Benutzer an alle außer Sender
      socket.emit('onlineUser',conClientsArr); //Übergabe der angemeldeten Benutzer an Sender
    }
  });
}

function addMsg(pUsername, pMsg){ //Funktion um Nachricht zum Speicherarray hinzuzufügen
  messages.push({
    username: pUsername,
    message: pMsg
  });
  saveChat(messages);
}

function saveChat(data){ //Funktion um Speicherarray in Datei zu schreiben
  let jsonData = JSON.stringify(data);
  fs.writeFile('messages.json',jsonData,function(err){
    if(err){
      console.log(err);
    }
  })
}