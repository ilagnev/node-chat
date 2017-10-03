const socketio = require('socket.io');
const members = [];
const rooms = [];

exports.listen = function chatServer (httpServer) {
	const io = socketio.listen(httpServer);
	
	io.sockets.on('connection', (socket) => {
		new Memeber(socket, io);
	});
};

class Memeber {
	constructor(socket, io) {
		this.socket = socket;
		this.io = io;
		this.name = this.generateName(socket.id);
		
		this.joinRoom('/');

		this.handleMessage();
		this.handleRoomChange();
	}

	generateName(id) {
		return 'guest_' + id.substr(0, 4);
	}

	joinRoom(room) {
		this.room = room || '/';
		this.socket.join(this.room, () => {
			console.log('join to room: ', this.name, this.room);
			
			this.socket.emit('connected', {
				'me': {
					'name': this.name, 
					'room': this.room
				}
			});
			
			this.io.to(this.room).emit('member-connected', {
				'name': this.name
			});
		});
	}

	handleMessage() {
		this.socket.on('message', (message) => {
			console.log('message: ', message);
			
			// message format
			const chatMessage = `${this.name}: ${message.text}`; 
			
			// send message to the current room
			this.io.to(this.room)
				.emit('message', {
					'member': {'name': this.name}, 
					'text': chatMessage
				});
		});
	}

	handleRoomChange() {
		this.socket.on('change-room', (room) => {
			// leave previous room
			const prevRoom = this.room;
			this.socket.leave(prevRoom, () => {
				// send message 'member leave'
				this.io.to(prevRoom).emit('member-leave', {
					'name': this.name
				});
			})
			
			// joint to next
			this.joinRoom(room);
		})
		
	}
}
