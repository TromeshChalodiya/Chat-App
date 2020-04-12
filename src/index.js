const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const BadWords = require('bad-words');
const {
  generateMessage,
  generateLocationMessage,
} = require('./utils/messages');

const {
  addUsers,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
  socket.on('join', (options, callback) => {
    const { error, user } = addUsers({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    // scoket.emit ---> sending information to specific client
    // io.emit ----> sendign information to all client
    // socket.broadcase.emit ----> sending information to all client except socket
    // io.to.emit ----> emit an event to everybody in specific room
    // socket.broadcast.to.emit ---> sending info to everyone except for specific client and limiting to a specific chat room

    socket.emit('message', generateMessage('Admin', `Welcome!`));
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage('Admin', `${user.username} has joined!`)
      );

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  // socket.broadcast.emit('message', generateMessage('A new user has joined!'));

  socket.on('sendMessage', (message, callback) => {
    const filter = new BadWords();

    const user = getUser(socket.id);

    if (user) {
      if (filter.isProfane(message)) {
        return callback('Profinity is not allowed');
      }

      io.to(user.room).emit('message', generateMessage(user.username, message));
      callback();
    }
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);
    if (user) {
    }
    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(
        user.username,
        `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage('Admin', `${user.username} has left!`)
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`server is up on port ${port}`);
});
