const router = require("express").Router();
const userController = require("../controller/user.controller");
const todoController = require("../controller/todo.controller");
const authmiddleware = require("../middleware/authMiddleware");
const limiter = require("../middleware/rateLimiter");

router.post("/register", userController.register);

router.post("/login", userController.login);

router.post("/refreshtoken", userController.refreshAccessToken);

router.post(
  "/createtodo",
  authmiddleware,
  limiter,

  todoController.createTodo
);

router.get("/readtodo/:id", authmiddleware, todoController.readTodo);

router.get("/readAlltodos", authmiddleware, todoController.readAllTodo);

router.put("/edittodo/:id", authmiddleware, todoController.editTodo);

router.delete("/removetodo/:id", authmiddleware, todoController.removeTodo);

module.exports = router;
