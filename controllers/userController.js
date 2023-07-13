const { User, Thought } = require('../models');

const customUserController = {
  // Retrieve all users
  getAllUsers(req, res) {
    User.find()
      .then((users) => res.json(users))
      .catch((err) => res.status(500).json(err));
  },
  
  // Retrieve a single user by id
  getUserById(req, res) {
    User.findOne({ _id: req.params.userId })
      .select('-__v')
      .populate({
        path: 'thoughts',
        select: '-__v'
      })
      .populate({
        path: 'friends',
        select: '-__v'
      })
      .then((user) => {
        if (!user) {
          res.status(404).json({ message: 'No user found with that ID' });
        } else {
          res.json(user);
        }
      })
      .catch((err) => res.status(500).json(err));
  },
  
  // Create a new user
  createUser(req, res) {
    User.create(req.body)
      .then((dbUserData) => res.json(dbUserData))
      .catch((err) => res.status(500).json(err));
  },
  
  // Update a user
  updateUser(req, res) {
    User.findOneAndUpdate(
      { _id: req.params.userId },
      { $set: req.body },
      { runValidators: true, new: true }
    )
      .then((user) => {
        if (!user) {
          res.status(404).json({ message: 'No user found with this id!' });
        } else {
          res.json(user);
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },
  
  // Delete a user and associated thoughts
  deleteUser(req, res) {
    User.findOneAndDelete({ _id: req.params.userId })
      .then((user) => {
        if (!user) {
          res.status(404).json({ message: 'No user found with that ID' });
        } else {
          return Thought.deleteMany({ _id: { $in: user.thoughts } });
        }
      })
      .then(() => res.json({ message: 'User and associated thoughts deleted!' }))
      .catch((err) => res.status(500).json(err));
  },
  
  // Add a friend
  addFriend(req, res) {
    User.findOneAndUpdate(
      { _id: req.params.userId },
      { $push: { friends: req.params.friendId } },
      { runValidators: true, new: true }
    )
      .then((user) => {
        if (!user) {
          res.status(404).json({ message: 'No user found with this id!' });
        } else {
          res.json(user);
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },
  
  // Delete a friend
  deleteFriend(req, res) {
    User.findOneAndUpdate(
      { _id: req.params.userId },
      { $pull: { friends: req.params.friendId } },
      { runValidators: true, new: true }
    )
      .then((user) => {
        if (!user) {
          res.status(404).json({ message: 'No user found with this id!' });
        } else {
          res.json(user);
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  }
};

module.exports = customUserController;

