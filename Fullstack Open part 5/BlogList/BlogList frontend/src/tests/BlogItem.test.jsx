import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BlogItem from "../Components/BlogItem";

describe("BlogItem", () => {
  const blog = {
    title: "Test Blog Title",
    author: "Test Author",
    url: "http://testurl.com",
    likes: 42,
    likedBy: [],
  };

  it("renders title and author, but not url or likes by default", () => {
    render(
      <BlogItem
        blog={blog}
        onDelete={() => {}}
        onLike={() => {}}
        onUnlike={() => {}}
        currentUserId={null}
      />
    );
    expect(screen.getByTestId("blog-title")).toBeVisible();
    expect(screen.getByTestId("blog-author")).toBeVisible();
    expect(screen.queryByTestId("blog-url")).toBeNull();
    expect(screen.queryByTestId("blog-likes")).toBeNull();
  });

  it("shows url and likes when details button is clicked", () => {
    render(
      <BlogItem
        blog={blog}
        onDelete={() => {}}
        onLike={() => {}}
        onUnlike={() => {}}
        currentUserId={null}
      />
    );
    fireEvent.click(screen.getByTestId("toggle-details"));
    expect(screen.getByTestId("blog-url")).toBeVisible();
    expect(screen.getByTestId("blog-likes")).toBeVisible();
  });

  it("calls the like handler twice if like button is clicked twice", () => {
    const handleLike = vi.fn();
    render(
      <BlogItem
        blog={{ ...blog, likedBy: [] }}
        onDelete={() => {}}
        onLike={handleLike}
        onUnlike={() => {}}
        currentUserId={"user1"}
      />
    );
    // Open details to show like button
    fireEvent.click(screen.getByTestId("toggle-details"));
    const likeButton = screen.getByTestId("like");
    fireEvent.click(likeButton);
    fireEvent.click(likeButton);
    expect(handleLike).toHaveBeenCalledTimes(2);
  });
});
