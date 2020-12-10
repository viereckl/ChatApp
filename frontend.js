var socket = io();

var user = false;
let colors = ['#800000', '#ff0000', '#800080', '#ff00ff', '#ff00ff', '#00ff00', '#808000', '#000080', '#0000ff', '#008080', '#00ffff', '#ffa500', '#7fffd4', '#8a2be2', '#a52a2a', '#5f9ea0', '#7fff00', '#d2691e', '#ff7f50', '#6495ed', '#b8860b', '#006400', '#bdb76b', '#ff1493', '#1e90ff', '#cd853f', '#a0522d', '#4682b4', '#40e0d0', '#ee82ee', '#9acd32', '#00008B', '#8b864e', '#ff7f00', '#8b7355', '#b23aee'];
let uColor = Math.floor(Math.random() * (colors.length));
document.getElementById('login').onsubmit = function (e) {
    if (!document.getElementById('un').value || /^\s/.test(document.getElementById('un').value)) {
    document.getElementById('alertMessage').innerHTML = 'Kein g\u00fcltiger Benutzername!';
    document.getElementById('unAlert').style.display = 'block';
  } else {
    socket.emit('login', document.getElementById('un').value, uColor);
  }
  return false;
}
socket.on('checkLogin', function (check) {
  if (check === true) {
    document.getElementById('alertMessage').innerHTML = 'Der Benutzername ist bereits vergeben!';
    document.getElementById('unAlert').style.display = 'block';
  } else {
    document.getElementById('navWrapper').style.display = "flex";
    document.getElementById('unAlert').style.display = 'none';

    user = document.getElementById('un').value;
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
    document.getElementById('displayUser').append(user);

    document.getElementById('msgForm').onsubmit =function (e) {
      e.preventDefault(); // prevents page reloading
      if (!document.getElementById('m').value || /^\s/.test(document.getElementById('m').value)) { return; }
      socket.emit('chat message', document.getElementById('m').value, uColor, user);
      createMessage(document.getElementById('m').value, 1, uColor, user);
      document.getElementById('m').value = '';
      return false;
    };
  }


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
          createMessage(msg.message, 1, -1, msg.username);
        } else {
          createMessage(msg.message, 0, -1, msg.username);
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

  function createMessage(pMessage, pType, pColor = -1, pUser = 'System') {
    msg = document.createElement('div');
    if (pType === 0 || pType === 1) { //links oder rechts zu zeigende Chatnachricht
      msg.classList.add('msg');
      msgIcon = document.createElement('div');
      msgIcon.style.backgroundColor = pColor === -1 ? 'lightgray' : colors[pColor];
      msgIcon.classList.add('UserIcon');
      msgIconDiv = document.createElement('div');
      msgIconDiv.append(pUser.charAt(0).toUpperCase());
      msgIconDiv.classList.add('UserIconLetter');
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
    var oldDiv = document.getElementById('conUsers');
    if (oldDiv) { oldDiv.remove() }

    const users = document.createElement('div');
    users.id = 'conUsers';
    conClients.sort((a, b) => (a.un > b.un) ? 1 : ((b.un > a.un) ? -1 : 0)); //sort Clients
    for (let i = 0; i < conClients.length; i++) {
      userClient = document.createElement('div');
      userClient.classList.add('userClient');
      UserIcon = document.createElement('div');
      UserIcon.style.backgroundColor = colors[conClients[i].color];
      UserIcon.classList.add('UserIcon');
      UserIcon.classList.add('small-UserIcon');
      UserIconDiv = document.createElement('div');
      UserIconDiv.append(conClients[i].un.charAt(0).toUpperCase());
      UserIconDiv.classList.add('UserIconLetter');
      UserIconDiv.classList.add('small-UserIconLetter');
      UserIcon.appendChild(UserIconDiv);

      userClient.appendChild(UserIcon);
      onlineUser = document.createElement('p');
      onlineUser.classList.add('w3-bar-item');
      onlineUser.append(conClients[i].un);
      userClient.appendChild(onlineUser);
      if (conClients[i].un === user) {
        youT = document.createElement('i');
        youT.append('(You)');
        youT.style.margin = 'auto 3px';
        userClient.appendChild(youT);
      }
      conClients[i].un === user ? users.prepend(userClient) : users.appendChild(userClient);
    }
    document.getElementById('sidebarHeading').innerHTML = 'Online-' + conClients.length;
    document.getElementById('mySidebar').appendChild(users);
  }
});

function sidebarToggle() {
  if (toggle === 'closed') {
    document.getElementById("main").style.marginLeft = "25%";
    document.getElementById("mySidebar").style.width = "25%";
    document.getElementById("mySidebar").style.display = "block";
    toggle = 'opened';
  } else {
    document.getElementById("main").style.marginLeft = "0%";
    document.getElementById("mySidebar").style.display = "none";
    document.getElementById("openNav").style.display = "inline-block";
    toggle = 'closed';
  }
}