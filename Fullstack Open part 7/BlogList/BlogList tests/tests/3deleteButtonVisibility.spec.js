const { test, expect, describe } = require("@playwright/test");

describe("Blog delete button visibility", () => {
  test("only the user who added the blog sees the delete button", async ({
    request,
    page,
  }) => {
    // Reset backend and create two users
    await request.post("http://localhost:3003/api/testing/reset");
    await request.post("http://localhost:3003/api/users", {
      data: { username: "owner", password: "ownerpass" },
    });
    await request.post("http://localhost:3003/api/users", {
      data: { username: "otheruser", password: "otherpass" },
    });

    // Login as owner and create a blog
    await page.goto("http://localhost:5173");
    await page.getByTestId("login-username-input").fill("owner");
    await page.getByTestId("login-password-input").fill("ownerpass");
    await page.getByTestId("login-btn").click();
    await expect(page.getByTestId("logged-in-user")).toHaveText(
      "Logged in as owner"
    );
    await page.getByRole("button", { name: /create new blog/i }).click();
    await page.getByTestId("blog-title-input").fill("Owner Blog");
    await page.getByTestId("blog-author-input").fill("Owner Author");
    await page.getByTestId("blog-url-input").fill("http://owner.test");
    await page.getByTestId("add-blog-btn").click();
    await expect(page.getByTestId("blog-title-Owner-Blog")).toBeVisible();
    // Open blog details
    const blogItem = page
      .locator("li.blog-item")
      .filter({ has: page.getByTestId("blog-title-Owner-Blog") });
    await blogItem.getByTestId("toggle-details").click();
    // Owner should see delete button
    await expect(page.getByTestId("delete-blog")).toBeVisible();

    // Logout owner
    await page.getByRole("button", { name: /logout/i }).click();

    // Login as otheruser
    await page.getByTestId("login-username-input").fill("otheruser");
    await page.getByTestId("login-password-input").fill("otherpass");
    await page.getByTestId("login-btn").click();
    await expect(page.getByTestId("logged-in-user")).toHaveText(
      "Logged in as otheruser"
    );
    // Open blog details as otheruser
    const blogItemOther = page
      .locator("li.blog-item")
      .filter({ has: page.getByTestId("blog-title-Owner-Blog") });
    await blogItemOther.getByTestId("toggle-details").click();
    // Other user should NOT see delete button
    await expect(page.getByTestId("delete-blog")).toHaveCount(0);
  });
});

// Move this test to the end to ensure it runs last
