const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");

describe("Token extractor middleware", () => {
  beforeEach(async () => {
    const User = require("../models/user");
    await User.deleteMany({ username: "tokentestuser_token" });
  });

  test("request.token is set when Authorization header is present", async () => {
    // ...existing code...
  });

  test("request.token is null if Authorization header is missing", async () => {
    // ...existing code...
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
