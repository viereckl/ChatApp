$(function () {
    var socket = io();
    $('#login').submit(function(e){
      socket.emit('login',$('#un').val());
      return false;
    })
    socket.on('checkLogin', function(check){
      if(check === true){
        window.alert("Der Benutzername ist schon vergeben!") //hübscheres Design
      }else{
        document.getElementById('login').style.display = 'none';
        document.getElementById('msg').style.display = 'block';
        $('#messages').append($('<li class="bold">').text($('#un').val() + ' logged in'));
        document.getElementById('messages').lastChild.style.textAlign = 'center';
      }
    })
    $('#msg').submit(function(e){
      e.preventDefault(); // prevents page reloading
      socket.emit('chat message', $('#m').val(), $('#un').val());
      $('#messages').append($('<li>').text('me: ' + $('#m').val()));
      document.getElementById('messages').lastChild.style.textAlign = 'right';
      $('#m').val('');
      return false;
    });
    socket.on('chat message', function(msg, uName){
      $('#messages').append($('<li>').text(uName + ': ' + msg));
    });
    socket.on('login message', function(text){
      $('#messages').append($('<li class="bold">').text(text));
      document.getElementById('messages').lastChild.style.textAlign = 'center';
    })
    socket.on('init msg',function(messages){
      for(let i = 0; messages.length; i++){
        msg = messages[i]
        if(msg.username === 'System'){
          $('#messages').append($('<li class="bold">').text(msg.message));
          document.getElementById('messages').lastChild.style.textAlign = 'center';
        }else{
          $('#messages').append($('<li>').text(msg.username + ': ' + msg.message));
          if($('#un').val() === msg.username){
            document.getElementById('messages').lastChild.style.textAlign = 'right';
          }
        }
      }
    })
    socket.on('onlineUser',function(conClients){
      console.log(conClients); //Anzeige aller angemeldeten Clients
    })
  }); 