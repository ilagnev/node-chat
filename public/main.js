let socket = null;

// start the app
document.addEventListener('DOMContentLoaded', () => {
	const initialParams = {};
	if (localStorage.name) initialParams.name = localStorage.name;

	socket = io.connect('', initialParams);
	ChatApp();
});

function ChatApp() {
	//console.log(socket)
	this == window

	ChatApp.cleanScreen();

	// attach listen event to update chat window
	socket.on('message', (message) => {
		console.log('message received: ', message);
		ChatApp.displayMessage(message.text);
	});
	
	socket.on('connected', (data) => {
		console.log('connected: ', data);
		
		// clean previous messages
		ChatApp.cleanScreen();
	});
	
	socket.on('member-connected', (info) => {
		console.log('member-connected: ', info);
		
		ChatApp.displayMessage(
			info.name + ' join the room ' + info.room, 
			'info'
		);

		// update users list
		ChatApp.updateMembers(info.members);
	});
	
	socket.on('member-leave', (member) => {
		console.log('member-leave: ', member);
		ChatApp.displayMessage(
			member.name + ' leave the room', 
			'info'
		);
	});
	
	socket.on('member-rename', (name) => {
		console.log('member-rename: ', name);
		ChatApp.displayMessage(
			name.old + ' renamed to ' + name.new, 
			'info'
		);
	});

	socket.on('rooms-update', (rooms) => {
		console.log('rooms-update: ', rooms);

		// show available rooms
		ChatApp.updateRooms(rooms);
	});

	ChatApp.handleSubmit();
}

ChatApp.handleSubmit = () => {
	// send message on form submit and clean-up message input
	const messageInput = document.querySelector('#message-input');
	const form = document.querySelector('#message-form');
	form.addEventListener('submit', (e) => {
		e.preventDefault();

		// parse commands
		let input = messageInput.value;

		if (input.substr(0, 1) === '/') {
			ChatApp.processCommand(input.split(' '));
		} else {
			ChatApp.sendMessage(input);
		}
		
		messageInput.value = '';
		messageInput.focus();

		return false;
	});

	messageInput.focus();
}

ChatApp.processCommand = (args) => {
	console.log('process command: ', args)
	switch (args[0]) {
		case '/name':// change name
			//socket.emit('change-name', args[1]);
			ChatApp.changeRoom(args[1]);
			break;
		case '/room':// change room
			socket.emit('change-room', args[1]);
			break;
		default:
			alert('unknow command: ' + args[0]);
	}
}

ChatApp.changeRoom = (room) => {
	socket.emit('change-name', room);
}

// send message to server
ChatApp.sendMessage = (message) => {
	socket.emit('message', {
		'text': message
	});
}

// display message with specific className in the main window
ChatApp.displayMessage = (text, className) => {
	let li = document.createElement('li');
	li.innerHTML = text;
	if (className) 
		li.classList.add(className);

	let messages = document.querySelector('#messages');
	messages.appendChild(li);
	messages.scrollTop = messages.scrollHeight - messages.clientHeight;
}

ChatApp.cleanScreen = () => {
	document.querySelector('#messages').innerHTML = '';

	ChatApp.displayMessage('Welcome to chat');
	ChatApp.displayMessage('commands: /name /room');
}

ChatApp.updateRooms = (roomsList) => {
	// show available rooms
	const rooms = document.querySelector('#rooms');
	rooms.innerHTML = roomsList.map(room => {
		return `<li><a href="#${room}">${room}</a></li>`;
	}).join('');
	
	// attach click event to change room
	rooms.querySelectorAll('a')
		.forEach(link => link.addEventListener('click', (e) => {
			//console.log(link);
			ChatApp.changeRoom(link.innerText);
		}));
}

ChatApp.updateMembers = (membersList) => {
	// show available rooms
	const members = document.querySelector('#members');
	members.innerHTML = membersList.map(member => {
		return `<li>${member}</li>`;
	}).join('');
}