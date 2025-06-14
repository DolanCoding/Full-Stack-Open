import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function BlogItem({ blog, onDelete, onLike, onUnlike, currentUserId }) {
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
        <Link to={`/blogs/${blog.id || blog._id}`} className="blog-link">
          {blog.title}
        </Link>
      </span>
      <span className="blog-author" data-testid="blog-author">
        by {blog.author}
      </span>
      {blog.user &&
        (blog.user.id === currentUserId || blog.user._id === currentUserId) && (
          <button
            onClick={() => onDelete(blog.id || blog._id)}
            className="delete-btn"
            data-testid="delete-blog"
          >
            Delete
          </button>
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
