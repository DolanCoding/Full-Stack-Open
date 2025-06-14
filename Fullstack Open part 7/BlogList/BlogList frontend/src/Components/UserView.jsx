import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function UserView() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3003/api/users/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading user...</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div className="user-view-container">
      <h2>{user.username}</h2>
      <h3>Added blogs</h3>
      {user.blogs && user.blogs.length > 0 ? (
        <ul className="user-blogs-list">
          {user.blogs.map((blog) => (
            <li key={blog.id || blog._id}>
              {blog.title} by {blog.author}
            </li>
          ))}
        </ul>
      ) : (
        <p>No blogs added.</p>
      )}
    </div>
  );
}

export default UserView;
