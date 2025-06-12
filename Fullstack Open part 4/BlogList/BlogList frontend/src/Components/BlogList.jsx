import React from "react";
import BlogItem from "./BlogItem";

function BlogList({ blogs, onDelete, onLikeChange }) {
  return (
    <ul className="blog-list">
      {(Array.isArray(blogs) ? blogs : []).map((blog, idx) => (
        <BlogItem
          blog={blog}
          key={blog.id || blog._id || idx}
          onDelete={onDelete}
          onLikeChange={onLikeChange}
        />
      ))}
    </ul>
  );
}

export default BlogList;
