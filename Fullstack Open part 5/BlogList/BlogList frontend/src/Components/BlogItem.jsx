import React, { useState } from "react";
import PropTypes from "prop-types";

function BlogItem({ blog, onDelete, onLike, onUnlike, currentUserId }) {
  const [showDetails, setShowDetails] = useState(false);

  const likedByUser =
    blog.likedBy &&
    currentUserId &&
    blog.likedBy.some((u) => {
      if (typeof u === "string") return u === currentUserId;
      if (u && typeof u === "object")
        return u.id === currentUserId || u._id === currentUserId;
      return false;
    });

  return (
    <li className="blog-item">
      <span
        className="blog-title"
        data-testid={`blog-title-${blog.title.replace(/\s+/g, "-")}`}
      >
        {blog.title}
      </span>
      <span className="blog-author" data-testid="blog-author">
        by {blog.author}
      </span>
      <button
        onClick={() => setShowDetails((v) => !v)}
        style={{ marginBottom: 8 }}
        data-testid="toggle-details"
      >
        {showDetails ? "hide" : "view"}
      </button>
      {blog.user &&
        (blog.user.id === currentUserId || blog.user._id === currentUserId) && (
          <button
            onClick={() => onDelete(blog.id || blog._id)}
            className="delete-btn"
            data-testid="delete-blog"
            style={{ marginLeft: 8 }}
          >
            Delete
          </button>
        )}
      {showDetails && (
        <>
          <span className="blog-likes" data-testid="blog-likes">
            Likes: {blog.likes ?? 0}
            {likedByUser ? (
              <button
                onClick={() => onUnlike(blog)}
                aria-label="Remove like"
                style={{ marginLeft: 8 }}
                data-testid="remove-like"
              >
                remove like
              </button>
            ) : (
              <button
                onClick={() => onLike(blog)}
                aria-label="Increment likes"
                style={{ marginLeft: 8 }}
                data-testid="like"
              >
                like
              </button>
            )}
          </span>
          {blog.likedBy && blog.likedBy.length > 0 && (
            <div
              style={{
                fontSize: "0.95em",
                color: "#555",
                margin: "0.5em 0",
              }}
              data-testid="blog-likedby"
            >
              Liked by:{" "}
              {blog.likedBy.map((u) => u.username || u.id || u).join(", ")}
            </div>
          )}
          <a
            className="blog-url"
            href={blog.url}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="blog-url"
          >
            {blog.url}
          </a>
        </>
      )}
    </li>
  );
}

BlogItem.propTypes = {
  blog: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  onUnlike: PropTypes.func.isRequired,
  currentUserId: PropTypes.string,
};

export default BlogItem;
