const { LOG } = require("../../utils/logger");
const responseStructure = require("../../utils/responseStructure");
const Todo = require("../models/task.model");
const User = require("../models/user.model");

const createTodo = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id; // Get userId from the token

    // Find user and update their actions
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const now = Date.now();

    await user.save();

    // Create a new To-Do item
    const newTodo = {
      title,
      description,
      userId,
    };

    const newlist = new Todo(newTodo);
    await newlist.save();

    const responseMessage = responseStructure.successResponse(
      "Todo created successfully"
    );
    res.send(responseMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create To-Do" });
  }
};

const readTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({ error: "To-Do not found" });
    }
    res.status(200).json(todo);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch To-Do" });
  }
};

const readAllTodo = async (req, res) => {
  try {
    const todos = await Todo.find();
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch To-Dos" });
  }
};

const editTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isCompleted } = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { title, description, isCompleted },
      { new: true }
    );
    if (!updatedTodo) return res.status(404).json({ error: "To-Do not found" });
    res.status(200).json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: "Failed to update To-Do" });
  }
};

const removeTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTodo = await Todo.findByIdAndDelete(id);
    if (!deletedTodo) return res.status(404).json({ error: "To-Do not found" });
    res.status(200).json({ message: "To-Do deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete To-Do" });
  }
};

module.exports = {
  createTodo,
  readTodo,
  readAllTodo,
  editTodo,
  removeTodo,
};
