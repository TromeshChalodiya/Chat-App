const users = [];
// addUsers, removeUser, getUsers, getUsersInRoom

const addUsers = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username && !room) {
    return { error: `UserName and Room are required!` };
  }

  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  if (existingUser) {
    return {
      error: `UserName is in use`
    };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = id => {
  const user = users.find(user => {
    return user.id === id;
  });
  if (!user) {
    return undefined;
  } else {
    return user;
  }
};

const getUsersInRoom = room => {
  room = room.trim().toLowerCase();
  return users.filter(user => user.room === room);
};

module.exports = {
  addUsers,
  removeUser,
  getUser,
  getUsersInRoom
};
