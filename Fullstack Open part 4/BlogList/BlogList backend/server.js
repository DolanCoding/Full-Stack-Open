const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorHandler");
const tokenExtractor = require("./middleware/tokenExtractor");
const userExtractor = require("./middleware/userExtractor");
const Blog = require("./models/blog");
const User = require("./models/user");

const app = express();

let mongoUrl;
if (process.env.NODE_ENV === "test") {
  mongoUrl =
    "mongodb+srv://Dolan:sasfis13@fullstackopenphonebook.pq2eclk.mongodb.net/bloglist_test?retryWrites=true&w=majority&appName=FullstackOpenPhonebook";
} else {
  mongoUrl =
    "mongodb+srv://Dolan:sasfis13@fullstackopenphonebook.pq2eclk.mongodb.net/bloglist?retryWrites=true&w=majority&appName=FullstackOpenPhonebook";
}
mongoose.connect(mongoUrl);

app.use(cors());
app.use(express.json());
app.use(logger.requestLogger);
app.use(tokenExtractor);

const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }
  return null;
};

app.get("/api/blogs", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", ["id", "username"]);
  response.json(blogs);
});

app.post("/api/blogs", userExtractor, async (request, response) => {
  const body = request.body;
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: "token missing or invalid" });
  }
  if (!body.title || !body.url) {
    return response.status(400).json({ error: "title and url are required" });
  }
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes === undefined ? 0 : body.likes,
    user: user._id,
  });
  const savedBlog = await blog.save();
  response
    .status(201)
    .json(await savedBlog.populate("user", ["id", "username"]));
});

app.delete("/api/blogs/:id", userExtractor, async (request, response, next) => {
  try {
    const user = request.user;
    if (!user) {
      return response.status(401).json({ error: "token missing or invalid" });
    }
    const blog = await Blog.findById(request.params.id);
    if (!blog) {
      return response.status(404).json({ error: "Blog not found" });
    }
    if (blog.user && blog.user.toString() !== user._id.toString()) {
      return response.status(401).json({
        error: "only the creator can delete this blog",
      });
    }
    await Blog.findByIdAndDelete(request.params.id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.put("/api/blogs/:id", async (request, response, next) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true, runValidators: true }
    );
    if (updatedBlog) {
      response.json(updatedBlog);
    } else {
      response.status(404).json({ error: "Blog not found" });
    }
  } catch (error) {
    next(error);
  }
});

app.post("/api/users", async (request, response, next) => {
  try {
    const { username, password } = request.body;
    if (!username || !password || password.length < 3) {
      return response
        .status(400)
        .json({ error: "username and password (min 3 chars) required" });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return response.status(400).json({ error: "username must be unique" });
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = new User({ username, passwordHash });
    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
});

app.post("/api/login", async (request, response, next) => {
  try {
    const { username, password } = request.body;
    const user = await User.findOne({ username });
    const passwordCorrect =
      user && (await bcrypt.compare(password, user.passwordHash));
    if (!user || !passwordCorrect) {
      return response
        .status(401)
        .json({ error: "invalid username or password" });
    }
    // You can use a real secret in production
    const userForToken = { username: user.username, id: user._id };
    const token = jwt.sign(userForToken, "SECRET_KEY", { expiresIn: "1h" });
    response.json({ token, username: user.username, id: user._id });
  } catch (error) {
    next(error);
  }
});

app.get("/api/users", async (request, response) => {
  const users = await User.find({}).populate({
    path: "blogs",
    select: ["id", "title", "author", "url", "likes"],
  });
  response.json(users);
});

app.use(errorHandler);

// Remove app.listen from here! Only export the app for testing and importing.

module.exports = app;
