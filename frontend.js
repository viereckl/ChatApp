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
      const msgUl = document.createElement('ul');
      msgUl.id = 'messages';
      document.body.appendChild(msgUl);
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
        $('#messages').append($('<li>').text('me: ' + $('#m').val()));
        document.getElementById('messages').lastChild.style.textAlign = 'right';
        $('#m').val('');
        return false;
      });
    }
  })

  socket.on('chat message', function (msg, uName) {
    $('#messages').append($('<li>').text(uName + ': ' + msg));
  });
  socket.on('login message', function (text) {
    $('#messages').append($('<li class="bold">').text(text));
    document.getElementById('messages').lastChild.style.textAlign = 'center';
  })
  socket.on('init msg', function (messages) {
    for (let i = 0; i < messages.length; i++) {
      msg = messages[i];
      if (msg.username === 'System') {
        $('#messages').append($('<li class="bold">').text(msg.message));
        document.getElementById('messages').lastChild.style.textAlign = 'center';
      } else {
        $('#messages').append($('<li>').text(msg.username + ': ' + msg.message));
        if (user === msg.username) {
          document.getElementById('messages').lastChild.style.textAlign = 'right';
        }
      }
    }
    $('#messages').append($('<li class="bold">').text(user + ' logged in'));
    document.getElementById('messages').lastChild.style.textAlign = 'center';
  })
  socket.on('onlineUser', function (conClients) {
    console.log(conClients); //Anzeige aller angemeldeten Clients
  })
}); 