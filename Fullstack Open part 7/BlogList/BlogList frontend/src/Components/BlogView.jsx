import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import BlogCommentForm from "./BlogCommentForm";

function BlogView() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3003/api/blogs/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBlog(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading blog...</div>;
  if (!blog) return <div>Blog not found.</div>;

  // Helper to check if current user liked the blog
  const likedByUser =
    blog &&
    user &&
    blog.likedBy &&
    blog.likedBy.some((u) => {
      const userId = user.id || user._id;
      if (!userId) return false;
      if (typeof u === "string") return u === userId;
      if (u && typeof u === "object")
        return u.id === userId || u._id === userId;
      return false;
    });

  const handleLike = () => {
    fetch(`http://localhost:3003/api/blogs/${blog.id || blog._id}/like`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((res) => res.json())
      .then((updatedBlog) => setBlog(updatedBlog));
  };

  const handleUnlike = () => {
    fetch(`http://localhost:3003/api/blogs/${blog.id || blog._id}/unlike`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((res) => res.json())
      .then((updatedBlog) => setBlog(updatedBlog));
  };

  return (
    <div className="blog-view-container">
      <h2>{blog.title}</h2>
      <p>
        <b>Author:</b> {blog.author}
      </p>
      <p>
        <b>URL:</b>{" "}
        <a href={blog.url} target="_blank" rel="noopener noreferrer">
          {blog.url}
        </a>
      </p>
      <p>
        <b>Likes:</b> {blog.likes ?? 0}
        {user &&
          (likedByUser ? (
            <button
              onClick={handleUnlike}
              className="like-btn"
              data-testid="remove-like"
            >
              remove like
            </button>
          ) : (
            <button
              onClick={handleLike}
              className="like-btn"
              data-testid="like"
            >
              like
            </button>
          ))}
      </p>
      {blog.user && (
        <p>
          <b>Added by:</b> {blog.user.username}
        </p>
      )}
      {blog.likedBy && blog.likedBy.length > 0 && (
        <div>
          <b>Liked by:</b>{" "}
          {blog.likedBy.map((u) => u.username || u.id || u).join(", ")}
        </div>
      )}

      {/* Comments section */}
      <div className="blog-comments-section">
        <h3>Comments</h3>
        <BlogCommentForm blogId={blog.id || blog._id} onCommentAdded={setBlog} />
        {Array.isArray(blog.comments) && blog.comments.length > 0 ? (
          <ul className="blog-comments-list">
            {blog.comments.map((comment, idx) => (
              <li key={idx} className="blog-comment-item">
                {comment}
              </li>
            ))}
          </ul>
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
    </div>
  );
}

export default BlogView;
