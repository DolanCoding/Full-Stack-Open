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
const testingRouter = require("express").Router();

let mongoUrl;
console.log("NODE_ENV raw value:", JSON.stringify(process.env.NODE_ENV));
if (process.env.NODE_ENV === "test") {
  console.log("Running in test mode");
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

app.get("/api/blogs", async (request, response) => {
  const blogs = await Blog.find({})
    .populate("user", ["id", "username"])
    .populate("likedBy", ["id", "username"]);
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
  await savedBlog.populate("user", ["id", "username"]);
  await savedBlog.populate("likedBy", ["id", "username"]);
  response.status(201).json(savedBlog);
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
      await updatedBlog.populate("user", ["id", "username"]);
      await updatedBlog.populate("likedBy", ["id", "username"]);
      response.json(updatedBlog);
    } else {
      response.status(404).json({ error: "Blog not found" });
    }
  } catch (error) {
    next(error);
  }
});

app.put(
  "/api/blogs/:id/like",
  userExtractor,
  async (request, response, next) => {
    try {
      const user = request.user;
      if (!user) {
        return response.status(401).json({ error: "token missing or invalid" });
      }
      const blog = await Blog.findById(request.params.id);
      if (!blog) {
        return response.status(404).json({ error: "Blog not found" });
      }
      if (blog.likedBy.includes(user._id)) {
        return response
          .status(400)
          .json({ error: "User already liked this blog" });
      }
      blog.likedBy.push(user._id);
      blog.likes = (blog.likes || 0) + 1;
      await blog.save();
      await blog.populate("user", ["id", "username"]);
      await blog.populate("likedBy", ["id", "username"]);
      response.json(blog);
    } catch (error) {
      next(error);
    }
  }
);

app.put(
  "/api/blogs/:id/unlike",
  userExtractor,
  async (request, response, next) => {
    try {
      const user = request.user;
      if (!user) {
        return response.status(401).json({ error: "token missing or invalid" });
      }
      const blog = await Blog.findById(request.params.id);
      if (!blog) {
        return response.status(404).json({ error: "Blog not found" });
      }
      const idx = blog.likedBy.findIndex(
        (id) => id.toString() === user._id.toString()
      );
      if (idx === -1) {
        return response
          .status(400)
          .json({ error: "User has not liked this blog" });
      }
      blog.likedBy.splice(idx, 1);
      blog.likes = Math.max((blog.likes || 1) - 1, 0);
      await blog.save();
      await blog.populate("user", ["id", "username"]);
      await blog.populate("likedBy", ["id", "username"]);
      response.json(blog);
    } catch (error) {
      next(error);
    }
  }
);

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

app.get("/api/users/:id", async (request, response, next) => {
  try {
    const user = await User.findById(request.params.id).populate({
      path: "blogs",
      select: ["id", "title", "author", "url", "likes"],
    });
    if (!user) {
      return response.status(404).json({ error: "User not found" });
    }
    response.json(user);
  } catch (error) {
    next(error);
  }
});

app.get("/api/blogs/:id/likes", async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id).populate("likedBy", [
      "id",
      "username",
    ]);
    if (!blog) {
      return response.status(404).json({ error: "Blog not found" });
    }
    response.json({
      blogId: blog.id,
      likedBy: blog.likedBy.map((user) => ({
        id: user.id,
        username: user.username,
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/blogs/:id", async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
      .populate("user", ["id", "username"])
      .populate("likedBy", ["id", "username"]);
    if (!blog) {
      return response.status(404).json({ error: "Blog not found" });
    }
    response.json(blog);
  } catch (error) {
    next(error);
  }
});

app.post("/api/blogs/:id/comments", async (request, response, next) => {
  try {
    const { comment } = request.body;
    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return response.status(400).json({ error: "Comment is required" });
    }
    const blog = await Blog.findById(request.params.id);
    if (!blog) {
      return response.status(404).json({ error: "Blog not found" });
    }
    if (!Array.isArray(blog.comments)) blog.comments = [];
    blog.comments.push(comment.trim());
    await blog.save();
    await blog.populate("user", ["id", "username"]);
    await blog.populate("likedBy", ["id", "username"]);
    response.status(201).json(blog);
  } catch (error) {
    next(error);
  }
});

testingRouter.post("/reset", async (req, res) => {
  await Blog.deleteMany({});
  await User.deleteMany({});
  res.status(204).end();
});

app.use("/api/testing", testingRouter);

app.use(errorHandler);

// Remove app.listen from here! Only export the app for testing and importing.

module.exports = app;
