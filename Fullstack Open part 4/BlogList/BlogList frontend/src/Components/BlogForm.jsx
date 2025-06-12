import React from "react";

function BlogForm({
  title,
  author,
  url,
  onTitleChange,
  onAuthorChange,
  onUrlChange,
  onSubmit,
}) {
  return (
    <form className="add-blog-form" onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Blog title"
        value={title}
        onChange={onTitleChange}
        required
      />
      <input
        type="text"
        placeholder="Author"
        value={author}
        onChange={onAuthorChange}
        required
      />
      <input
        type="url"
        placeholder="URL"
        value={url}
        onChange={onUrlChange}
        required
      />
      <button type="submit">Add blog</button>
    </form>
  );
}

export default BlogForm;
