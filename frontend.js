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
      /*const sidebar = document.createElement('div'); 
      sidebar.class = 'w3-sidebar w3-bar-block w3-card w3-animate-left'
      sidebar.style = 'display:none'
      sidebar.id = 'mySidebar'
      const closeSB = document.createElement('button'); 
      closeSB.class = 'w3-bar-item w3-button w3-large'
      closeSB.onclick = 'w3_close'
      closeSB.append('Close &times;');
      sidebar.appendChild(closeSB);
      const main = document.createElement('div');
      main.id = 'main';
      const openDiv = document.createElement('div');
      openDiv.class = 'w3-teal';
      const openNav = document.createElement('button');
      openNav.id = 'openNav'
      openNav.class = 'w3-button w3-teal w3-xlarge'
      openNav.onclick = 'w3_open'
      openNav.append('&#9776;')
      openDiv.appendChild(openNav)
      main.appendChild(openDiv)
*/

      user = $('#un').val();
      document.getElementById('login').remove();
      const chat = document.createElement('div');
      chat.style.padding = '10px';
      chat.style.marginBottom = '50px';
      chat.id = 'messages';
      document.getElementById('main').appendChild(chat);
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
      
     // document.body.appendChild(sidebar);
     // document.body.appendChild(main);
      document.getElementById('main').appendChild(msgForm);

      $('#msg').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#m').val(), user);
        createMessage('me: ' + $('#m').val(),1);
        $('#m').val('');
        return false;
      });
      function w3_open() {
        document.getElementById("main").style.marginLeft = "25%";
        document.getElementById("mySidebar").style.width = "25%";
        document.getElementById("mySidebar").style.display = "block";
        document.getElementById("openNav").style.display = 'none';
      }
      function w3_close() {
        document.getElementById("main").style.marginLeft = "0%";
        document.getElementById("mySidebar").style.display = "none";
        document.getElementById("openNav").style.display = "inline-block";
      }
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