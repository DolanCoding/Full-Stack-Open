const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");
const userExtractor = require("../middleware/userExtractor");

// Helper to create a user and return token
async function createUserAndToken() {
  const username = `testuser_${Date.now()}_${Math.floor(
    Math.random() * 10000
  )}`;
  const passwordHash = "hashedpassword";
  const user = new User({ username, passwordHash });
  await user.save();
  const token = jwt.sign({ username, id: user._id }, "SECRET_KEY");
  return { user, token };
}

describe("userExtractor middleware", () => {
  let app;
  beforeAll(async () => {
    await mongoose.connect(
      process.env.NODE_ENV === "test"
        ? "mongodb+srv://Dolan:sasfis13@fullstackopenphonebook.pq2eclk.mongodb.net/bloglist_test?retryWrites=true&w=majority&appName=FullstackOpenPhonebook"
        : "mongodb+srv://Dolan:sasfis13@fullstackopenphonebook.pq2eclk.mongodb.net/bloglist?retryWrites=true&w=majority&appName=FullstackOpenPhonebook"
    );
  });
  beforeEach(async () => {
    await User.deleteMany({});
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("attaches user to request if token is valid", async () => {
    const { user, token } = await createUserAndToken();
    app = express();
    app.use((req, res, next) => {
      req.token = token;
      next();
    });
    app.use(userExtractor);
    app.get("/test", (req, res) => {
      res.json({ user: req.user ? req.user.username : null });
    });
    const res = await request(app).get("/test");
    expect(res.body.user).toBe(user.username);
  });

  it("sets request.user to null if token is missing", async () => {
    app = express();
    app.use((req, res, next) => {
      req.token = null;
      next();
    });
    app.use(userExtractor);
    app.get("/test", (req, res) => {
      res.json({ user: req.user });
    });
    const res = await request(app).get("/test");
    expect(res.body.user).toBeNull();
  });

  it("sets request.user to null if token is invalid", async () => {
    app = express();
    app.use((req, res, next) => {
      req.token = "invalidtoken";
      next();
    });
    app.use(userExtractor);
    app.get("/test", (req, res) => {
      res.json({ user: req.user });
    });
    const res = await request(app).get("/test");
    expect(res.body.user).toBeNull();
  });

  it("sets request.user to null if user does not exist", async () => {
    // Create a token for a non-existent user
    const fakeId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ username: "ghost", id: fakeId }, "SECRET_KEY");
    app = express();
    app.use((req, res, next) => {
      req.token = token;
      next();
    });
    app.use(userExtractor);
    app.get("/test", (req, res) => {
      res.json({ user: req.user });
    });
    const res = await request(app).get("/test");
    expect(res.body.user).toBeNull();
  });
});
