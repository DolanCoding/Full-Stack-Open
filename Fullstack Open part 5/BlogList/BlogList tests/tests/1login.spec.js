const { test, expect, beforeEach, describe } = require("@playwright/test");

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    // Empty the database
    await request.post("http://localhost:3003/api/testing/reset");
    // Create a user for the backend
    await request.post("http://localhost:3003/api/users", {
      data: {
        username: "testuser",
        password: "testpass",
      },
    });
    await page.goto("http://localhost:5173");
  });

  test("Login form is shown", async ({ page }) => {
    await expect(page.getByTestId("login-form")).toBeVisible();
    await expect(page.getByTestId("login-username-input")).toBeVisible();
    await expect(page.getByTestId("login-password-input")).toBeVisible();
    await expect(page.getByTestId("login-btn")).toBeVisible();
  });

  describe("Login", () => {
    test("succeeds with correct credentials", async ({ page }) => {
      await page.getByTestId("login-username-input").fill("testuser");
      await page.getByTestId("login-password-input").fill("testpass");
      await page.getByTestId("login-btn").click();
      await expect(page.getByTestId("logged-in-user")).toHaveText(
        "Logged in as testuser"
      );
    });

    test("fails with wrong credentials", async ({ page }) => {
      await page.getByTestId("login-username-input").fill("testuser");
      await page.getByTestId("login-password-input").fill("wrongpass");
      await page.getByTestId("login-btn").click();
      await expect(page.getByText(/login failed/i)).toBeVisible();
    });
  });
});
