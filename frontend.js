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
        $('#messages').append($('<div>').text('me: ' + $('#m').val()));
        document.getElementById('messages').lastChild.style.textAlign = 'right';
        document.getElementById('messages').lastChild.scrollIntoView();
        $('#m').val('');
        return false;
      });
    }
  })

  socket.on('chat message', function (msg, uName) {
    $('#messages').append($('<div>').text(uName + ': ' + msg));
    document.getElementById('messages').lastChild.scrollIntoView();
  });
  socket.on('login message', function (text) {
    $('#messages').append($('<div class="bold">').text(text));
    document.getElementById('messages').lastChild.style.textAlign = 'center';
    document.getElementById('messages').lastChild.scrollIntoView();
  })
  socket.on('init msg', function (messages) {
    for (let i = 0; i < messages.length; i++) {
      msg = messages[i];
      if (msg.username === 'System') {
        $('#messages').append($('<div class="bold">').text(msg.message));
        document.getElementById('messages').lastChild.style.textAlign = 'center';
      } else {
        $('#messages').append($('<div>').text(msg.username + ': ' + msg.message));
        if (user === msg.username) {
          document.getElementById('messages').lastChild.style.textAlign = 'right';
        }
      }
    }
    $('#messages').append($('<div class="bold">').text(user + ' logged in'));
    document.getElementById('messages').lastChild.style.textAlign = 'center';
    document.getElementById('messages').lastChild.scrollIntoView();
  })
  socket.on('onlineUser', function (conClients) {
    console.log(conClients); //Anzeige aller angemeldeten Clients
  })
}); 