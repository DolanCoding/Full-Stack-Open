const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(
      process.env.NODE_ENV === "test"
        ? "mongodb+srv://Dolan:sasfis13@fullstackopenphonebook.pq2eclk.mongodb.net/bloglist_test?retryWrites=true&w=majority&appName=FullstackOpenPhonebook"
        : "mongodb+srv://Dolan:sasfis13@fullstackopenphonebook.pq2eclk.mongodb.net/bloglist?retryWrites=true&w=majority&appName=FullstackOpenPhonebook"
    );
  }
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once("open", resolve));
  }
});

describe("User registration and login", () => {
  beforeEach(async () => {
    // Clear both users and blogs for full isolation
    const User = require("../models/user");
    const Blog = require("../models/blog");
    await User.deleteMany({});
    await Blog.deleteMany({});
  });

  test("POST /api/users registers a new user", async () => {
    const newUser = { username: "testuser", password: "testpass" };
    const response = await request(app)
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    expect(response.body.username).toBe(newUser.username);
    expect(response.body.id).toBeDefined();
    // Password hash should not be returned
    expect(response.body.passwordHash).toBeUndefined();
  });

  test("POST /api/users fails with short password", async () => {
    const newUser = { username: "shortpass", password: "12" };
    const response = await request(app)
      .post("/api/users")
      .send(newUser)
      .expect(400);
    expect(response.body.error).toMatch(/min 3 chars/);
  });

  test("POST /api/users fails with duplicate username", async () => {
    const newUser = { username: "dupeuser", password: "testpass" };
    await request(app).post("/api/users").send(newUser).expect(201);
    const response = await request(app)
      .post("/api/users")
      .send(newUser)
      .expect(400);
    expect(response.body.error).toMatch(/unique/);
  });

  test("POST /api/login succeeds with correct credentials", async () => {
    const newUser = { username: "loginuser", password: "testpass" };
    await request(app).post("/api/users").send(newUser).expect(201);
    const response = await request(app)
      .post("/api/login")
      .send(newUser)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    expect(response.body.token).toBeDefined();
    expect(response.body.username).toBe(newUser.username);
  });

  test("POST /api/login fails with wrong password", async () => {
    const newUser = { username: "wrongpassuser", password: "testpass" };
    await request(app).post("/api/users").send(newUser).expect(201);
    const response = await request(app)
      .post("/api/login")
      .send({ username: "wrongpassuser", password: "wrong" })
      .expect(401);
    expect(response.body.error).toMatch(/invalid/);
  });

  test("POST /api/users fails with missing username", async () => {
    const newUser = { password: "validpass" };
    const response = await request(app)
      .post("/api/users")
      .send(newUser)
      .expect(400);
    expect(response.body.error).toMatch(/username and password/);
  });

  test("POST /api/users fails with missing password", async () => {
    const newUser = { username: "validuser" };
    const response = await request(app)
      .post("/api/users")
      .send(newUser)
      .expect(400);
    expect(response.body.error).toMatch(/username and password/);
  });

  test("GET /api/users returns all users", async () => {
    // Register two users
    const users = [
      { username: "user1", password: "pass1" },
      { username: "user2", password: "pass2" },
    ];
    for (const user of users) {
      await request(app).post("/api/users").send(user).expect(201);
    }
    const response = await request(app)
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);
    const usernames = response.body.map((u) => u.username);
    expect(usernames).toContain("user1");
    expect(usernames).toContain("user2");
    // Should not include passwordHash
    expect(response.body[0].passwordHash).toBeUndefined();
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception thrown:", err);
});
