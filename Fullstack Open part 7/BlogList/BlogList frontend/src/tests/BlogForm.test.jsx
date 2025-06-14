import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BlogForm from "../Components/BlogForm";

describe("BlogForm", () => {
  it("calls onCreate with the right details when a new blog is created", () => {
    const handleCreate = vi.fn();
    render(<BlogForm onCreate={handleCreate} onCancel={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText("Blog title"), {
      target: { value: "My New Blog" },
    });
    fireEvent.change(screen.getByPlaceholderText("Author"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("URL"), {
      target: { value: "http://example.com" },
    });
    fireEvent.click(screen.getByText("Add blog"));

    expect(handleCreate).toHaveBeenCalledTimes(1);
    expect(handleCreate.mock.calls[0][0]).toEqual({
      title: "My New Blog",
      author: "Jane Doe",
      url: "http://example.com",
    });
  });
});
