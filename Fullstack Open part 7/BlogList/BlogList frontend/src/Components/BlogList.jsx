import React from "react";
import { Link } from "react-router-dom";
import BlogItem from "./BlogItem";

function BlogList({ blogs, onDelete, onLike, onUnlike, currentUserId }) {
  return (
    <ul className="blog-list" data-testid="blog-list">
      {(Array.isArray(blogs) ? blogs : []).map((blog, idx) => (
        <BlogItem
          blog={blog}
          key={blog.id || blog._id || idx}
          onDelete={onDelete}
          onLike={onLike}
          onUnlike={onUnlike}
          currentUserId={currentUserId}
        />
      ))}
    </ul>
  );
}

export default BlogList;
