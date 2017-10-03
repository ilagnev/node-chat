const socketio = require('socket.io');
let members = [];
const rooms = [];

exports.listen = (httpServer) => {
	const io = socketio.listen(httpServer);
	
	io.sockets.on('connection', (socket) => {
		initNewMember(socket, io);
	});
};

function initNewMember(socket, io) {

	let member = {};

	// generate temp name
	member.name = generateName(socket.id);
	//member.socket = socket;
	member.room = '/';
	members.push(member);
	//console.log('member inited: ', member.name);

	// join to the room and send events about this
	socket.join(member.room, () => {
		console.log('join to room: ', member);
		socket.emit('connected', {'me': member});
		io.to(member.room)
			.emit('member-connected', member);
	});

	socket.on('message', (message) => {
		console.log('message: ', message);
		const chatMessage = `${member.name}: ${message.text}`; 
		
		io.to(member.room)
		.emit('message', {
			'member': member, 
			'text': chatMessage
		});
	});

}

function generateName(id) {
	return 'guest_' + id.substr(0, 4);
}