import User from '../models/userModel.js';

async function createUser({ username, password, role }) {
  const user = new User({ username, password, role });
  return await user.save();
}

async function findByUsername(username) {
  return await User.findOne({ username });
}

export default {
  createUser,
  findByUsername
};
