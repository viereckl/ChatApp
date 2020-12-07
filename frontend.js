$(function () {
  var socket = io();

  var user = false;
  let colors = ['#8A2BE2', '#00008B', '#006400', '#8b864e', '#ff7f00', '#ff0000', '#8b7355', '#ee82ee', '#b23aee', '#ffa500'];
  let uColor = Math.floor(Math.random() * colors.length);
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
      main.appendChild(openDiv)*/

      user = $('#un').val();
      document.getElementById('loginContainer').remove();
      const chat = document.createElement('div');
      //chat.style.padding = '10px';
      //chat.style.marginBottom = '50px';
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

      //document.body.appendChild(sidebar);
      //document.body.appendChild(main);
      document.getElementById('main').appendChild(msgForm);

      $('#msgForm').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        if (!$('#m').val()) { return; }
        socket.emit('chat message', $('#m').val(), uColor, user);
        createMessage($('#m').val(), 1, uColor, user);
        $('#m').val('');
        return false;
      });
      //function w3_open() {
      //  document.getElementById("main").style.marginLeft = "25%";
      //  document.getElementById("mySidebar").style.width = "25%";
      //  document.getElementById("mySidebar").style.display = "block";
      //  document.getElementById("openNav").style.display = 'none';
      //}
      //function w3_close() {
      //  document.getElementById("main").style.marginLeft = "0%";
      //  document.getElementById("mySidebar").style.display = "none";
      //  document.getElementById("openNav").style.display = "inline-block";
      //}
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
    createMessage(user + ' logged in', 2);
  })
  socket.on('onlineUser', function (conClients) {
    if (user != false) {
      displayOnlineUser(conClients);
    }
  })

  function createMessage(pMessage, pType, pColor = 0, pUser = 'System') {
    $('#messages').append($('<div>'));
    msg = document.getElementById('messages').lastChild;

    if (pType === 0 || pType === 1) { //links oder rechts zu zeigende Chatnachricht
      msg.classList.add('msg');
      msgIcon = document.createElement('div');
      //msgIcon.style.backgroundImage = "url('https://image.flaticon.com/icons/svg/327/327779.svg')";
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
    for (let i = 0; i < conClients.length; i++) {
      onlineUser.push(document.createElement('a'))
      onlineUser[i].href = "#"
      onlineUser[i].className = "w3-bar-item w3-button"
      onlineUser[i].append(conClients[i].un);
    }
    onlineUser.forEach(element => {
      users.appendChild(element);
    })
    document.getElementById('mySidebar').appendChild(users);
    console.log(conClients); //Anzeige aller angemeldeten Clients
  }
}); 