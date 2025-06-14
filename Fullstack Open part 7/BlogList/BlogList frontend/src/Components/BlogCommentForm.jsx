import { useState } from "react";

function BlogCommentForm({ blogId, onCommentAdded }) {
  const [commentInput, setCommentInput] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setCommentLoading(true);
    fetch(`http://localhost:3003/api/blogs/${blogId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: commentInput.trim() }),
    })
      .then((res) => res.json())
      .then((updatedBlog) => {
        onCommentAdded(updatedBlog);
        setCommentInput("");
      })
      .finally(() => setCommentLoading(false));
  };

  return (
    <form
      className="add-comment-form"
      onSubmit={handleAddComment}
      style={{ marginBottom: "1rem" }}
    >
      <input
        type="text"
        value={commentInput}
        onChange={(e) => setCommentInput(e.target.value)}
        placeholder="Add a comment..."
        disabled={commentLoading}
        className="comment-input"
        required
      />
      <button
        type="submit"
        className="comment-btn"
        disabled={commentLoading || !commentInput.trim()}
      >
        {commentLoading ? "Adding..." : "Add comment"}
      </button>
    </form>
  );
}

export default BlogCommentForm;
