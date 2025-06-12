const { test, expect, beforeEach, describe } = require("@playwright/test");

describe("When logged in", () => {
  beforeEach(async ({ request, page }) => {
    // Reset backend and create user
    await request.post("http://localhost:3003/api/testing/reset");
    await request.post("http://localhost:3003/api/users", {
      data: {
        username: "testuser",
        password: "testpass",
      },
    });
    await page.goto("http://localhost:5173");
    // Login
    await page.getByTestId("login-username-input").fill("testuser");
    await page.getByTestId("login-password-input").fill("testpass");
    await page.getByTestId("login-btn").click();
    await expect(page.getByTestId("logged-in-user")).toHaveText(
      "Logged in as testuser"
    );
  });

  test("a new blog can be created", async ({ page }) => {
    await page.getByRole("button", { name: /create new blog/i }).click();
    await expect(page.getByTestId("blog-form")).toBeVisible();
    await page.getByTestId("blog-title-input").fill("Playwright Blog");
    await page.getByTestId("blog-author-input").fill("Playwright Author");
    await page.getByTestId("blog-url-input").fill("http://playwright.test");
    await page.getByTestId("add-blog-btn").click();
    // Wait for notification to appear (more flexible match)
    await expect(
      page.getByText(/new blog.*Playwright Blog.*Playwright Author/i)
    ).toBeVisible();
    await expect(page.getByTestId("blog-title-Playwright-Blog")).toBeVisible();
    await expect(page.getByTestId("blog-author")).toHaveText(
      "by Playwright Author"
    );
  });

  test("a blog can be liked", async ({ page }) => {
    // Create a blog first
    await page.getByRole("button", { name: /create new blog/i }).click();
    await expect(page.getByTestId("blog-form")).toBeVisible();
    await page.getByTestId("blog-title-input").fill("Likeable Blog");
    await page.getByTestId("blog-author-input").fill("Like Author");
    await page.getByTestId("blog-url-input").fill("http://like.test");
    await page.getByTestId("add-blog-btn").click();
    await expect(page.getByTestId("blog-title-Likeable-Blog")).toBeVisible();
    // Open blog details
    const blogItem = page
      .locator("li.blog-item")
      .filter({ has: page.getByTestId("blog-title-Likeable-Blog") });
    await blogItem.getByTestId("toggle-details").click();
    // Like the blog
    const likesText = await page.getByTestId("blog-likes");
    const initialLikes = parseInt(
      (await likesText.textContent()).match(/\d+/)[0],
      10
    );
    await page.getByTestId("like").click();
    await expect(page.getByText(`Likes: ${initialLikes + 1}`)).toBeVisible();
  });

  test("the user who added the blog can delete the blog", async ({ page }) => {
    // Create a blog first
    await page.getByRole("button", { name: /create new blog/i }).click();
    await expect(page.getByTestId("blog-form")).toBeVisible();
    await page.getByTestId("blog-title-input").fill("Deletable Blog");
    await page.getByTestId("blog-author-input").fill("Delete Author");
    await page.getByTestId("blog-url-input").fill("http://delete.test");
    await page.getByTestId("add-blog-btn").click();
    await expect(page.getByTestId("blog-title-Deletable-Blog")).toBeVisible();
    // Open blog details
    const blogItem = page
      .locator("li.blog-item")
      .filter({ has: page.getByTestId("blog-title-Deletable-Blog") });
    await blogItem.getByTestId("toggle-details").click();
    // Intercept window.confirm and auto-accept
    page.on("dialog", (dialog) => dialog.accept());
    // Click delete
    await page.getByTestId("delete-blog").click();
    // Ensure the blog is no longer visible
    await expect(page.getByTestId("blog-title-Deletable-Blog")).toHaveCount(0);
  });
});
