const { User, Thought } = require('../models');

const customThoughtController = {
  // Retrieve all thoughts
  getAllThoughts(req, res) {
    Thought.find()
      .populate({
        path: 'reactions',
        select: '-__v'
      })
      .then((thoughts) => res.json(thoughts))
      .catch((err) => res.status(500).json(err));
  },
  
  // Retrieve a single thought by id
  getThoughtById(req, res) {
    Thought.findOne({ _id: req.params.thoughtId })
      .select('-__v')
      .populate({
        path: 'reactions',
        select: '-__v'
      })
      .then((thought) => {
        if (!thought) {
          res.status(404).json({ message: 'No thought found with that ID' });
        } else {
          res.json(thought);
        }
      })
      .catch((err) => res.status(500).json(err));
  },
  
  // Create a new thought
  createThought(req, res) {
    console.log(req.body);
    Thought.create(req.body)
      .then((thought) => {
        User.findByIdAndUpdate(req.body.userId, { $addToSet: { thoughts: thought._id } }, { new: true })
          .then((user) => {
            if (!user) {
              res.status(404).json({ message: 'No user found with that ID, but thought was created' });
            } else {
              res.json(thought);
            }
          })
          .catch((err) => res.status(500).json(err));
      })
      .catch((err) => res.status(500).json(err));
  },
  
  // Update a thought
  updateThought(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $set: req.body },
      { runValidators: true, new: true }
    )
      .then((thought) => {
        if (!thought) {
          res.status(404).json({ message: 'No thought found with this id!' });
        } else {
          res.json(thought);
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },
  
  // Delete a thought
  deleteThought(req, res) {
    Thought.findOneAndDelete({ _id: req.params.thoughtId })
      .then((thought) => {
        if (!thought) {
          res.status(404).json({ message: 'No thoughts found with that id!' });
          return;
        }
        return User.findOneAndUpdate(
          { _id: req.params.userId },
          { $pull: { thoughts: req.params.Id } },
          { new: true }
        );
      })
      .then((userData) => {
        if (!userData) {
          res.status(404).json({ message: 'No User found with this id but thought deleted!' });
          return;
        }
        res.json(userData);
      })
      .catch((err) => res.json(err));
  },
  
  // Add a reaction
  addReaction(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $addToSet: { reactions: req.body } },
      { new: true }
    )
      .populate({ path: 'reactions', select: '-__v' })
      .select('-__v')
      .then((thought) => {
        if (!thought) {
          res.status(404).json({ message: 'No thought found with this id!' });
        } else {
          res.json(thought);
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },
  
  // Delete a reaction
  deleteReaction(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $pull: { reactions: { _id: req.params.reactionId } } },
      { new: true, runValidators: true }
    )
      .then((thoughtData) => {
        if (!thoughtData) {
          res.status(404).json({ message: 'Incorrect reaction data!' });
          return;
        }
        res.json(thoughtData);
      })
      .catch((err) => res.json(err));
  }
};

module.exports = customThoughtController;
