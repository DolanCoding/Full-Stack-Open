const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const Blog = require("../models/blog");

const initialBlogs = [
  { title: "Blog1", author: "Author1", url: "url1", likes: 5 },
  { title: "Blog2", author: "Author2", url: "url2", likes: 10 },
];

jest.setTimeout(60000);

describe("Blog API", () => {
  let token;
  beforeEach(async () => {
    const User = require("../models/user");
    const Blog = require("../models/blog");
    // Delete all users and blogs to ensure a clean state
    await User.deleteMany({});
    await Blog.deleteMany({});
    const uniqueUsername = `apitestuser_blog_${Date.now()}_${Math.floor(
      Math.random() * 100000
    )}`;
    const userData = { username: uniqueUsername, password: "apitestpass" };
    const userRes = await request(app).post("/api/users").send(userData);
    if (userRes.status !== 201) {
      console.error("User creation failed:", userRes.body);
      throw new Error(`User creation failed: ${JSON.stringify(userRes.body)}`);
    }
    // Short delay to allow MongoDB to index the new user
    await new Promise((resolve) => setTimeout(resolve, 300));
    let user = null;
    for (let i = 0; i < 200; i++) {
      user = await User.findOne({ username: userData.username });
      if (user) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!user) {
      const allUsers = await User.find({});
      console.error("User not found after creation. All users in DB:", allUsers);
      throw new Error("User not found after creation");
    }
    const loginRes = await request(app).post("/api/login").send(userData);
    token = loginRes.body.token;
    if (!token) {
      console.error("Login did not return a token. Login response:", loginRes.body);
      throw new Error("Login did not return a token");
    }
    // Wait for user to be available by ID after login, with logging
    let userById = null;
    for (let i = 0; i < 300; i++) {
      if (loginRes.body.id) {
        userById = await User.findById(loginRes.body.id);
        if (userById) {
          if (i > 0) console.log(`User found by ID after ${i} retries`);
          break;
        }
      }
      if (i % 50 === 0) {
        const allUsers = await User.find({});
        console.log(
          `[Retry ${i}] User not found by ID yet. All users:`,
          allUsers
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!userById) {
      const allUsers = await User.find({});
      console.error("User not found by ID after login. All users:", allUsers);
      throw new Error("User not found by ID after login");
    }
    console.log("Token for test:", token);
    const blogsWithUser = initialBlogs.map((b) => ({ ...b, user: user._id }));
    await Blog.insertMany(blogsWithUser);
    const userAfter = await User.findOne({ username: userData.username });
    console.log("User in DB after login:", userAfter);
  });

  test("GET /api/blogs returns blogs as json and correct amount", async () => {
    const res = await request(app)
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .expect("Content-Type", /application\/json/)
      .expect(200);

    expect(res.body).toHaveLength(initialBlogs.length);
  });

  test("GET /api/blogs blog unique identifier property is named id", async () => {
    const res = await request(app)
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    res.body.forEach((blog) => {
      expect(blog).toHaveProperty("id");
      expect(blog).not.toHaveProperty("_id");
    });
  });

  test("POST /api/blogs successfully creates a new blog post and increases count by one", async () => {
    const newBlog = {
      title: "New Blog",
      author: "New Author",
      url: "newurl.com",
      likes: 7,
    };

    const res = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(201);

    expect(res.body).toMatchObject(newBlog);

    const blogsAtEnd = await Blog.find({});
    expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1);
  });

  test("POST /api/blogs defaults likes to 0 if missing", async () => {
    const newBlog = {
      title: "New Blog Without Likes",
      author: "New Author",
      url: "newurllikes.com",
    };

    const res = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(201);

    expect(res.body.likes).toBe(0);
  });
  test("POST /api/blogs returns 400 if title is missing", async () => {
    const newBlog = {
      author: "Author without title",
      likes: 5,
    };
    const res = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(400);
    expect(res.body.error).toContain("title and url are required");
  });

  test("POST /api/blogs returns 400 if url is missing", async () => {
    const newBlog = {
      title: "Title without url",
      author: "Author",
      likes: 5,
    };
    const res = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(400);
    expect(res.body.error).toContain("title and url are required");
  });

  test("DELETE /api/blogs/:id deletes a blog and returns 204", async () => {
    const blogsAtStart = await Blog.find({});
    const blogToDelete = blogsAtStart[0];

    await request(app)
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const blogsAtEnd = await Blog.find({});
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1);

    const deletedBlog = await Blog.findById(blogToDelete.id);
    expect(deletedBlog).toBeNull();
  });

  test("DELETE /api/blogs/:id returns 404 if blog does not exist", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await request(app)
      .delete(`/api/blogs/${nonExistentId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });
  test("PUT /api/blogs/:id updates the number of likes", async () => {
    const blogsAtStart = await Blog.find({});
    const blogToUpdate = blogsAtStart[0];

    const updatedLikes = { likes: 20 };
    const res = await request(app)
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedLikes)
      .expect(200);

    expect(res.body.likes).toBe(updatedLikes.likes);

    const blogAfterUpdate = await Blog.findById(blogToUpdate.id);
    expect(blogAfterUpdate.likes).toBe(updatedLikes.likes);
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
