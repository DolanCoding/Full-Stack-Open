import React from "react";

function BlogItem({ blog, onDelete, onLikeChange }) {
  return (
    <li className="blog-item">
      <span className="blog-title">{blog.title}</span>
      <span className="blog-author">by {blog.author}</span>
      <span className="blog-likes">
        Likes: {blog.likes ?? 0}
        <button
          onClick={() => onLikeChange(blog, 1)}
          aria-label="Increment likes"
        >
          +
        </button>
        <button
          onClick={() => onLikeChange(blog, -1)}
          aria-label="Decrement likes"
          disabled={blog.likes <= 0}
        >
          -
        </button>
      </span>
      <a
        className="blog-url"
        href={blog.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {blog.url}
      </a>
      <button
        onClick={() => onDelete(blog.id || blog._id)}
        className="delete-btn"
      >
        Delete
      </button>
    </li>
  );
}

export default BlogItem;
