import React, { useState } from "react";

function BlogForm({ onCreate, onCancel }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({ title, author, url }, () => {
      setTitle("");
      setAuthor("");
      setUrl("");
    });
  };

  return (
    <form
      className="add-blog-form"
      onSubmit={handleSubmit}
      data-testid="blog-form"
    >
      <input
        type="text"
        placeholder="Blog title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        data-testid="blog-title-input"
      />
      <input
        type="text"
        placeholder="Author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        required
        data-testid="blog-author-input"
      />
      <input
        type="url"
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        data-testid="blog-url-input"
      />
      <button type="submit" data-testid="add-blog-btn">
        Add blog
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel} data-testid="cancel-blog-btn">
          Cancel
        </button>
      )}
    </form>
  );
}

export default BlogForm;
