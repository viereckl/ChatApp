$(function () {
  var socket = io();
  var user;
  $('#login').submit(function (e) {
    socket.emit('login', $('#un').val());
    return false;
  })
  socket.on('checkLogin', function (check) {
    if (check === true) {
      window.alert("Der Benutzername ist schon vergeben!") //hübscheres Design
    } else {
      user = $('#un').val();
      document.getElementById('login').remove();
      const chat = document.createElement('div');
      chat.style.padding = '10px';
      chat.style.marginBottom = '50px';
      chat.id = 'messages';
      //const msgUl = document.createElement('ul');
      //msgUl.id = 'messages';
      document.body.appendChild(chat);
      const msgForm = document.createElement('form');
      msgForm.id = 'msg';
      const msgInput = document.createElement('input');
      msgInput.id = 'm';
      msgInput.setAttribute("autocomplete", "off");
      msgForm.appendChild(msgInput);
      msgBtn = document.createElement('button');
      msgBtn.append('Send');
      msgBtn.setAttribute("type", "submit");
      msgForm.appendChild(msgBtn);
      document.body.appendChild(msgForm);

      $('#msg').submit(function (e) {
        e.preventDefault(); // prevents page reloading
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
    console.log(conClients); //Anzeige aller angemeldeten Clients
  })

  function createMessage(pMessage, pType, pUser = 'System') {
    $('#messages').append($('<div>'));
    msg = document.getElementById('messages').lastChild;

    if (pType === 0 || pType === 1) { //links oder rechts zu zeigende Chatnachricht
      msg.classList.add('msg');
      msgIcon = document.createElement('div');
      msgIcon.style.backgroundImage = "url('https://image.flaticon.com/icons/svg/327/327779.svg')";
      msgIcon.classList.add('msgIcon');
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
      if(pType === 0){
        msgBubble.classList.add('msgBubble-left');
      }else{
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
}); 