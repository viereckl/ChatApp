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
        createMessage('me: ' + $('#m').val(),1);
        $('#m').val('');
        return false;
      });
    }
  })

  socket.on('chat message', function (msg, uName) {
    createMessage(uName + ': ' + msg, 0);
  });
  socket.on('login message', function (text) {
    createMessage(text, 2);
  })
  socket.on('init msg', function (messages) {
    for (let i = 0; i < messages.length; i++) {
      msg = messages[i];
      if (msg.username === 'System') {
        createMessage(msg.message,2);
      } else {
        if (user === msg.username) {
          createMessage(msg.username + ': ' + msg.message, 1);
        }else{
          createMessage(msg.username + ': ' + msg.message, 0);
        }
      }
    }
    createMessage(user + ' logged in', 2);
  })
  socket.on('onlineUser', function (conClients) {
    console.log(conClients); //Anzeige aller angemeldeten Clients
  })

  function createMessage(pMessage, pType){
    switch (pType) {
      case 0: //show messages on the left side of the chat
        $('#messages').append($('<div>').text(pMessage));
        break;
      case 1: //show messages on the right side of the chat
        $('#messages').append($('<div>').text(pMessage));
        document.getElementById('messages').lastChild.style.textAlign = 'right';
        break;
      default: //show messages in the middle of the chat
        $('#messages').append($('<div class="bold">').text(pMessage));
        document.getElementById('messages').lastChild.style.textAlign = 'center';
        break;
    }
    document.getElementById('messages').lastChild.scrollIntoView();
  }
}); 