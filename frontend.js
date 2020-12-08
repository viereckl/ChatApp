$(function () {
  var socket = io();

  var user = false;
  let colors = ['#8A2BE2', '#00008B', '#006400', '#8b864e', '#ff7f00', '#ff0000', '#8b7355', '#ee82ee', '#b23aee', '#ffa500'];
  let uColor = Math.floor(Math.random() * colors.length);
  $('#login').submit(function (e) {
    if (!$('#un').val()) {
      window.alert("Kein g\u00fcltiger Benutzername!");
      document.getElementById('unAlert').style.display = 'block';
    } else {
      socket.emit('login', $('#un').val());
    }
    return false;
  })
  socket.on('checkLogin', function (check) {
    if (check === true) {
      document.getElementById('unAlert').style.display = 'block';
    } else {
      document.getElementById('navWrapper').style.display = "inline-block";
      document.getElementById('unAlert').style.display = 'none';
      
      user = $('#un').val();
      document.getElementById('loginContainer').remove();
      const chat = document.createElement('div');
      chat.id = 'messages';
      document.getElementById('main').appendChild(chat);
      const msgForm = document.createElement('form');
      msgForm.id = 'msgForm';
      const msgInput = document.createElement('input');
      msgInput.placeholder = 'Neue Nachricht';
      msgInput.id = 'm';
      msgInput.setAttribute("autocomplete", "off");
      msgForm.appendChild(msgInput);
      msgBtn = document.createElement('button');
      msgBtn.id = 'msgBtn';
      icon = document.createElement('i')
      icon.classList.add('fas');
      icon.classList.add('fa-paper-plane'); //fa-arrow-up
      icon.id = 'sendIcon';
      msgBtn.append(icon);
      msgBtn.setAttribute("type", "submit");
      msgForm.appendChild(msgBtn);

      document.getElementById('main').appendChild(msgForm);

      $('#msgForm').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        if (!$('#m').val()) { return; }
        socket.emit('chat message', $('#m').val(), uColor, user);
        createMessage($('#m').val(), 1, uColor, user);
        $('#m').val('');
        return false;
      });
    }
  })

  socket.on('chat message', function (msg, uColor, uName) {
    createMessage(msg, 0, uColor, uName);
  });
  socket.on('login message', function (text) {
    createMessage(text, 2);
  })
  socket.on('init msg', function (messages) {
    for (let i = 0; i < messages.length; i++) {
      msg = messages[i];
      if (msg.username === 'System') {
        createMessage(msg.message, 2);
      } else {
        if (user === msg.username) {
          createMessage(msg.message, 1, 0, msg.username);
        } else {
          createMessage(msg.message, 0, 0, msg.username);
        }
      }
    }
    createMessage(user + ' logged in!', 2);
  })
  socket.on('onlineUser', function (conClients) {
    if (user != false) {
      displayOnlineUser(conClients);
    }
  })

  function createMessage(pMessage, pType, pColor = 0, pUser = 'System') {
    msg = document.createElement('div');
    if (pType === 0 || pType === 1) { //links oder rechts zu zeigende Chatnachricht
      msg.classList.add('msg');
      msgIcon = document.createElement('div');
      msgIcon.style.backgroundColor = pColor === 0 ? 'lightgray' : colors[pColor];
      console.log(pColor === 0 ? 'lightgray' : colors[pColor]);
      msgIcon.classList.add('msgIcon');
      msgIconDiv = document.createElement('div');
      msgIconDiv.append(pUser.charAt(0).toUpperCase());
      msgIconDiv.id = ('msgIconLetter');
      msgIcon.appendChild(msgIconDiv);
      msg.append(msgIcon);

      msgUser = document.createElement('div');
      msgUser.append(pUser);
      msgUser.classList.add('msgUser');

      msgText = document.createElement('div');
      msgText.append(pMessage);
      msgText.classList.add('msgText');

      msgBubble = document.createElement('div');
      msgBubble.appendChild(msgUser);
      msgBubble.appendChild(msgText);
      msgBubble.classList.add('msgBubble');
      if (pType === 0) {
        msgBubble.classList.add('msgBubble-left');
      } else {
        msg.style.flexDirection = 'row-reverse';
        msgBubble.classList.add('msgBubble-right');
      }
      msg.appendChild(msgBubble);
    } else { //Systemnachricht
      msg.classList.add('sysMsg')
      msg.append(pMessage);
    }
    document.getElementById('messages').appendChild(msg);
    document.getElementById('messages').lastChild.scrollIntoView();
  }

  function displayOnlineUser(conClients) {
    var onlineUser = []
    var oldDiv = document.getElementById('conUsers');
    if (oldDiv) {
      oldDiv.remove();
    }
    const users = document.createElement('div');
    users.id = 'conUsers';
    console.log(conClients);
    //conClients.sort(); //nochmal überprüfen
    conClients.sort((a,b) => (a.un > b.un) ? 1 : ((b.un > a.un) ? -1 : 0)); //sort Clients
    for (let i = 0; i < conClients.length; i++) {
      onlineUser.push(document.createElement('a'))
      onlineUser[i].href = "#"
      onlineUser[i].className = "w3-bar-item w3-button"
      if(conClients[i].un === user){
        onlineUser[i].append(conClients[i].un + ' (ME)');
      }else{
        onlineUser[i].append(conClients[i].un);
      }
    }
    onlineUser.forEach(element => {
      users.appendChild(element);
    })
    document.getElementById('mySidebar').appendChild(users);
  }
}); 