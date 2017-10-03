let socket = null;
document.addEventListener('DOMContentLoaded', () => {
	
	socket = io.connect();
	//console.log(socket);

	// attach listen event to update chat window
	socket.on('message', (message) => {
		console.log('message received: ', message);
		displayMessage(message.text);
	});

	socket.on('connected', (data) => {
		console.log('connected: ', data);
	});

	socket.on('member-connected', (member) => {
		console.log('member-connected: ', member);
		displayMessage(
			member.name + ' join the room ' + member.room, 
			'info'
		);
	});

	// send message on form submit and clean-up message input
	const messageInput = document.querySelector('#message-input');
	const form = document.querySelector('#message-form');
	form.addEventListener('submit', (e) => {
		e.preventDefault();

		sendMessage(messageInput.value);
		messageInput.value = '';
		messageInput.focus();

		return false;
	});

	messageInput.focus();
});

// send message to server
function sendMessage(message) {
	// parse commands
	
	socket.emit('message', {
		'text': message
	});
};

function displayMessage(text, className) {
	let li = document.createElement('li');
	li.innerHTML = text;
	if (className) 
		li.classList.add(className);

	let messages = document.querySelector('#messages');
	messages.appendChild(li);
	messages.scrollTop = messages.scrollHeight - messages.clientHeight;
}


