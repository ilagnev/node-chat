const socketio = require('socket.io');
let members = [];
const defaultRoom = '/';

exports.listen = function ChatServer (httpServer) {
	const io = socketio.listen(httpServer);
	
	io.sockets.on('connection', (socket) => {
		
		// console.log(socket.request._query);
		const initialName = socket.request._query.name || '';

		members[socket.id] = new Memeber(socket, io, initialName);
	});
};

class Memeber {
	constructor(socket, io, name) {
		this.socket = socket;
		this.io = io;
		this.name = name || this.generateName(socket.id);
		
		this.joinRoom(defaultRoom);

		// attach events listeners to socket
		this.handleMessage();
		this.handleRoomChange();
		this.handleNameChange();
		this.handleDisconnect();
	}

	generateName(id) {
		return 'guest_' + id.substr(0, 4);
	}

	joinRoom(room) {
		this.room = room || '/';

		this.socket.join(this.room, () => {
			console.log('join to room: ', this.name, this.room);

			// notify socket about new connected room
			this.socket.emit('connected', {
				'me': {
					'name': this.name, 
					'room': this.room
				}
			});
			
			// update room with userslist
			this.io.to(this.room).emit('member-connected', {
				name: this.name,
				room: this.room,
				members: ['rambo', 'bond']
			});

			// update rooms list to all connected
			this.io.emit('rooms-update', this.collectRoomsNames());
		});
	}
	leaveCurrentRoom() {
		const prevRoom = this.room;
		this.socket.leave(prevRoom, () => {
			// send message 'member leave'
			this.io.to(prevRoom).emit('member-leave', {
				name: this.name,
				room: prevRoom
			});
		})
	}
	collectRoomsNames() {
		// collect rooms
		console.log('members length', Object.keys(members).length);

		// at first members was only array, but then it become object
		const rooms = Object.keys(members).reduce((acc, index) => {
			if (acc.indexOf(members[index].room) == -1)
				acc.push(members[index].room)			
			return acc;
		}, []).sort();

		// add default
		//if (rooms.indexOf(defaultRoom) == -1)
		//	rooms.unshift('/');// set default room
		
		console.log('rooms:', rooms);
		return rooms;
	}

	handleMessage() {
		this.socket.on('message', (message) => {
			console.log('message: ', message);
			
			// message format
			const chatMessage = `${this.name}: ${message.text}`; 
			
			// send message to the current room
			this.io.to(this.room).emit('message', {
				member: {name: this.name}, 
				text: chatMessage
			});
		});
	}

	handleRoomChange() {
		this.socket.on('change-room', (room) => {
			// leave previous room
			this.leaveCurrentRoom();
			
			// join to the new room
			this.joinRoom(room);
		})
	}

	handleNameChange() {
		this.socket.on('change-name', (name) => {
			console.log('change name to:', name);

			//todo: check if name used already
			const prevName = this.name;
			this.name = name;
			
			this.io.to(this.room).emit('member-rename', {
				old: prevName,
				new: this.name
			});
		})
	}

	handleDisconnect() {
		this.socket.on('disconnect', () => {
			console.log('disconnect', this.socket.id, this.name);
			
			this.leaveCurrentRoom();
			
			// remove current member from global list
			delete members[this.socket.id];

			// update rooms list to all connected
			this.io.emit('rooms-update', this.collectRoomsNames());
		})
	}
}
