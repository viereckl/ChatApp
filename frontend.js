$(function () {
  var socket = io();
  var user = false;
  let colors = ['#8A2BE2', ];
  $('#login').submit(function (e) {
    if (!$('#un').val()) {
      window.alert("Kein g\u00fcltiger Benutzername!");
    } else {
      socket.emit('login', $('#un').val());
    }
    return false;
  })
  socket.on('checkLogin', function (check) {
    if (check === true) {
      window.alert("Der Benutzername ist schon vergeben!") //hübscheres Design
    } else {
      document.getElementById('openNav').style.display = "inline-block";
      
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
        socket.emit('chat message', $('#m').val(), user);
        createMessage($('#m').val(), 1, user);
        $('#m').val('');
        return false;
      });
    }
  })

  socket.on('chat message', function (msg, uName) {
    createMessage(msg, 0, uName);
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
          createMessage(msg.message, 1, msg.username);
        } else {
          createMessage(msg.message, 0, msg.username);
        }
      }
    }
    createMessage(user + ' logged in', 2);
  })
  socket.on('onlineUser', function (conClients) {
    if(user != false){
      displayOnlineUser(conClients);
    }
  })

  function createMessage(pMessage, pType, pUser = 'System') {
    $('#messages').append($('<div>'));
    msg = document.getElementById('messages').lastChild;
    
    if (pType === 0 || pType === 1) { //links oder rechts zu zeigende Chatnachricht
      msg.classList.add('msg');
      msgIcon = document.createElement('div');
      //msgIcon.style.backgroundImage = "url('https://image.flaticon.com/icons/svg/327/327779.svg')";
      msgIcon.style.backgroundColor = colors[0];
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
    document.getElementById('messages').lastChild.scrollIntoView();
  }

  function displayOnlineUser(conClients) {
    var onlineUser = []
    var oldDiv = document.getElementById('conUsers');
    if(oldDiv){
      oldDiv.remove();
    }
    const users = document.createElement('div');
    users.id = 'conUsers';
    conClients.sort(); //nochmal überprüfen
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