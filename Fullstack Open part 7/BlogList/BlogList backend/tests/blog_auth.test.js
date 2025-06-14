const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");

describe("Blog creation authentication", () => {
  const userData = { username: "authuser_auth", password: "testpass" };
  let token = null;

  // Tests that do NOT require a valid user/token
  test("POST /api/blogs fails with 401 if token is missing", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "Test Author",
      url: "http://test.com",
    };
    const res = await request(app).post("/api/blogs").send(newBlog);
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/token missing or invalid/i);
  });

  test("POST /api/blogs fails with 401 if token is invalid", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "Test Author",
      url: "http://test.com",
    };
    const res = await request(app)
      .post("/api/blogs")
      .set("Authorization", "Bearer invalidtoken")
      .send(newBlog);
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/token missing or invalid/i);
  });

  // Tests that REQUIRE a valid user/token
  describe("with valid user and token", () => {
    beforeEach(async () => {
      // Clear both users and blogs for full isolation
      const User = require("../models/user");
      const Blog = require("../models/blog");
      await User.deleteMany({});
      await Blog.deleteMany({});
      await request(app).post("/api/users").send(userData);
      const loginRes = await request(app).post("/api/login").send(userData);
      token = loginRes.body.token;
      // Wait for user to be available by ID after login
      let user = null;
      for (let i = 0; i < 100; i++) {
        if (loginRes.body.id) {
          user = await User.findById(loginRes.body.id);
          if (user) break;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (!user) {
        throw new Error("User not found by ID after login");
      }
    });

    test("POST /api/blogs succeeds and sets user from token", async () => {
      const uniqueTitle = `Test Blog ${Date.now()}_${Math.floor(
        Math.random() * 100000
      )}`;
      const newBlog = {
        title: uniqueTitle,
        author: "Test Author",
        url: "http://test.com",
      };
      const res = await request(app)
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog);
      expect(res.status).toBe(201);
      expect(res.body.title).toBe(newBlog.title);
      expect(res.body.author).toBe(newBlog.author);
      expect(res.body.url).toBe(newBlog.url);
      expect(res.body.user).toBeDefined();
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
