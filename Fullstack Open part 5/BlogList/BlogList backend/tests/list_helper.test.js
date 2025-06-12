const listHelper = require("../utils/list_helper");

test("dummy returns one", () => {
  const blogs = [];
  const result = listHelper.dummy(blogs);
  expect(result).toBe(1);
});

describe("totalLikes", () => {
  test("of empty list is zero", () => {
    const blogs = [];
    const result = listHelper.totalLikes(blogs);
    expect(result).toBe(0);
  });

  test("when list has only one blog, equals the likes of that", () => {
    const blogs = [
      { title: "Blog1", author: "Author1", url: "url1", likes: 5 },
    ];
    const result = listHelper.totalLikes(blogs);
    expect(result).toBe(5);
  });

  test("of a bigger list is calculated right", () => {
    const blogs = [
      { title: "Blog1", author: "Author1", url: "url1", likes: 5 },
      { title: "Blog2", author: "Author2", url: "url2", likes: 10 },
      { title: "Blog3", author: "Author3", url: "url3", likes: 7 },
    ];
    const result = listHelper.totalLikes(blogs);
    expect(result).toBe(22);
  });
});

describe("favoriteBlog", () => {
  test("of empty list is null", () => {
    const blogs = [];
    const result = listHelper.favoriteBlog(blogs);
    expect(result).toBeNull();
  });

  test("when list has only one blog, returns that blog", () => {
    const blogs = [
      { title: "Blog1", author: "Author1", url: "url1", likes: 5 },
    ];
    const result = listHelper.favoriteBlog(blogs);
    expect(result).toEqual(blogs[0]);
  });

  test("of a bigger list returns the blog with most likes", () => {
    const blogs = [
      { title: "Blog1", author: "Author1", url: "url1", likes: 5 },
      { title: "Blog2", author: "Author2", url: "url2", likes: 10 },
      { title: "Blog3", author: "Author3", url: "url3", likes: 7 },
    ];
    const result = listHelper.favoriteBlog(blogs);
    expect(result).toEqual(blogs[1]);
  });
});

describe("mostBlogs", () => {
  test("of empty list is null", () => {
    const blogs = [];
    const result = listHelper.mostBlogs(blogs);
    expect(result).toBeNull();
  });

  test("when list has only one blog, returns that author with 1 blog", () => {
    const blogs = [
      { title: "Blog1", author: "Author1", url: "url1", likes: 5 },
    ];
    const result = listHelper.mostBlogs(blogs);
    expect(result).toEqual({ author: "Author1", blogs: 1 });
  });

  test("of a bigger list returns the author with most blogs", () => {
    const blogs = [
      { title: "Blog1", author: "Author1", url: "url1", likes: 5 },
      { title: "Blog2", author: "Author2", url: "url2", likes: 10 },
      { title: "Blog3", author: "Author1", url: "url3", likes: 7 },
      { title: "Blog4", author: "Author2", url: "url4", likes: 2 },
      { title: "Blog5", author: "Author1", url: "url5", likes: 1 },
    ];
    const result = listHelper.mostBlogs(blogs);
    expect(result).toEqual({ author: "Author1", blogs: 3 });
  });
});

describe("mostLikes", () => {
  test("of empty list is null", () => {
    const blogs = [];
    const result = listHelper.mostLikes(blogs);
    expect(result).toBeNull();
  });

  test("when list has only one blog, returns that author and likes", () => {
    const blogs = [
      { title: "Blog1", author: "Author1", url: "url1", likes: 5 },
    ];
    const result = listHelper.mostLikes(blogs);
    expect(result).toEqual({ author: "Author1", likes: 5 });
  });

  test("of a bigger list returns the author with most total likes", () => {
    const blogs = [
      { title: "Blog1", author: "Author1", url: "url1", likes: 5 },
      { title: "Blog2", author: "Author2", url: "url2", likes: 10 },
      { title: "Blog3", author: "Author1", url: "url3", likes: 7 },
      { title: "Blog4", author: "Author2", url: "url4", likes: 2 },
      { title: "Blog5", author: "Author1", url: "url5", likes: 1 },
    ];
    const result = listHelper.mostLikes(blogs);
    expect(result).toEqual({ author: "Author1", likes: 13 });
  });
});
