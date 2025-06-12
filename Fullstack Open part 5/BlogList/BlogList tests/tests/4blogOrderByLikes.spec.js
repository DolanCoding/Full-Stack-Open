const { test, expect, describe } = require("@playwright/test");

describe("Blog order by likes", () => {
  test("blogs are arranged in descending order of likes", async ({
    request,
    page,
  }) => {
    // Reset backend and create user
    await request.post("http://localhost:3003/api/testing/reset");
    await request.post("http://localhost:3003/api/users", {
      data: { username: "orderuser", password: "orderpass" },
    });

    // Login
    await page.goto("http://localhost:5173");
    await page.getByTestId("login-username-input").fill("orderuser");
    await page.getByTestId("login-password-input").fill("orderpass");
    await page.getByTestId("login-btn").click();
    await expect(page.getByTestId("logged-in-user")).toHaveText(
      "Logged in as orderuser"
    );

    // Add three blogs with different likes
    const blogs = [
      { title: "Least Likes", author: "A", url: "http://a.com", likes: 1 },
      { title: "Most Likes", author: "B", url: "http://b.com", likes: 10 },
      { title: "Medium Likes", author: "C", url: "http://c.com", likes: 5 },
    ];
    for (const blog of blogs) {
      await page.getByRole("button", { name: /create new blog/i }).click();
      await page.getByTestId("blog-title-input").fill(blog.title);
      await page.getByTestId("blog-author-input").fill(blog.author);
      await page.getByTestId("blog-url-input").fill(blog.url);
      await page.getByTestId("add-blog-btn").click();
      await expect(
        page.getByTestId(`blog-title-${blog.title.replace(/\s/g, "-")}`)
      ).toBeVisible();
    }

    // Create users for likes
    const likeCounts = {
      "Least Likes": 1,
      "Most Likes": 10,
      "Medium Likes": 5,
    };
    const totalUsers = Math.max(...Object.values(likeCounts));
    for (let i = 1; i <= totalUsers; i++) {
      await request.post("http://localhost:3003/api/users", {
        data: { username: `liker${i}`, password: `pass${i}` },
      });
    }

    // Helper to login as a user
    const loginAs = async (username, password) => {
      await page
        .getByRole("button", { name: /logout/i })
        .click()
        .catch(() => {});
      await page.getByTestId("login-username-input").fill(username);
      await page.getByTestId("login-password-input").fill(password);
      await page.getByTestId("login-btn").click();
      await expect(page.getByTestId("logged-in-user")).toHaveText(
        new RegExp(username)
      );
    };

    // Like blogs with different users
    for (const [title, count] of Object.entries(likeCounts)) {
      for (let i = 1; i <= count; i++) {
        await loginAs(`liker${i}`, `pass${i}`);
        const blogItem = page
          .locator("li.blog-item")
          .filter({
            has: page.getByTestId(`blog-title-${title.replace(/\s/g, "-")}`),
          });
        await blogItem.getByTestId("toggle-details").click();
        await expect(blogItem.getByTestId("like")).toBeVisible();
        await blogItem.getByTestId("like").click();
        await page.waitForTimeout(200);
      }
    }

    // Login back as the creator
    await loginAs("orderuser", "orderpass");
    await page.waitForTimeout(500);

    // Get all blog titles in order
    const blogTitles = await page
      .locator("li.blog-item [data-testid^='blog-title-']")
      .allTextContents();
    // Should be sorted: Most Likes, Medium Likes, Least Likes
    expect(blogTitles[0]).toContain("Most Likes");
    expect(blogTitles[1]).toContain("Medium Likes");
    expect(blogTitles[2]).toContain("Least Likes");
  });
});
