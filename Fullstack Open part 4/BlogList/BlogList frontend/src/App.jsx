import { useState, useEffect } from "react";
import "./style.css";
import BlogForm from "./Components/BlogForm";
import BlogList from "./Components/BlogList";
import LoginForm from "./Components/LoginForm";
import RegisterForm from "./Components/RegisterForm";

function App() {
  const [blogs, setBlogs] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  // Fetch blogs from backend
  useEffect(() => {
    fetch("http://localhost:3003/api/blogs")
      .then((res) => res.json())
      .then((data) => setBlogs(Array.isArray(data) ? data : []));
  }, []);

  const handleAddBlog = (e) => {
    e.preventDefault();
    const newBlog = { title, author, url };
    fetch("http://localhost:3003/api/blogs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(newBlog),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or error creating blog");
        return res.json();
      })
      .then((createdBlog) => {
        setBlogs((prevBlogs) => [
          createdBlog,
          ...(Array.isArray(prevBlogs) ? prevBlogs : []),
        ]);
        setTitle("");
        setAuthor("");
        setUrl("");
      })
      .catch((err) => alert(err.message));
  };

  // Delete blog handler
  const handleDeleteBlog = (id) => {
    fetch(`http://localhost:3003/api/blogs/${id}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }).then((res) => {
      if (res.ok) {
        // Refetch the blogs list after successful deletion
        fetch("http://localhost:3003/api/blogs")
          .then((res) => res.json())
          .then((data) => setBlogs(Array.isArray(data) ? data : []));
      } else if (res.status === 401) {
        res.json().then((data) => {
          alert(data.error || "You are not authorized to delete this blog.");
        });
      }
    });
  };

  // Like handler
  const handleLikeChange = (blog, delta) => {
    const updatedLikes = (blog.likes ?? 0) + delta;
    if (updatedLikes < 0) return;
    fetch(`http://localhost:3003/api/blogs/${blog.id || blog._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...blog, likes: updatedLikes }),
    })
      .then((res) => res.json())
      .then((updatedBlog) => {
        setBlogs((prevBlogs) =>
          prevBlogs.map((b) =>
            (b.id || b._id) === (updatedBlog.id || updatedBlog._id)
              ? updatedBlog
              : b
          )
        );
      });
  };

  const handleRegister = ({ username, password }) => {
    fetch("http://localhost:3003/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Registration failed");
        return res.json();
      })
      .then(() => {
        setShowRegister(false);
        alert("Registration successful! Please log in.");
      })
      .catch(() => alert("Registration failed"));
  };

  const handleLogin = ({ username, password }) => {
    fetch("http://localhost:3003/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Login failed");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setToken(data.token);
      })
      .catch(() => alert("Login failed"));
  };

  const handleLogout = () => setUser(null);

  return (
    <div className="app-container">
      <h1>Blog List</h1>
      {user ? (
        <>
          <div style={{ marginBottom: 16 }}>
            Logged in as <b>{user.username}</b>
            <button onClick={handleLogout} style={{ marginLeft: 8 }}>
              Logout
            </button>
          </div>
          <BlogForm
            title={title}
            author={author}
            url={url}
            onTitleChange={(e) => setTitle(e.target.value)}
            onAuthorChange={(e) => setAuthor(e.target.value)}
            onUrlChange={(e) => setUrl(e.target.value)}
            onSubmit={handleAddBlog}
          />
          <BlogList
            blogs={blogs}
            onDelete={handleDeleteBlog}
            onLikeChange={handleLikeChange}
          />
        </>
      ) : (
        <>
          {showRegister ? (
            <RegisterForm onRegister={handleRegister} />
          ) : (
            <LoginForm onLogin={handleLogin} />
          )}
          <button
            onClick={() => setShowRegister((v) => !v)}
            style={{ marginTop: 8 }}
          >
            {showRegister
              ? "Already have an account? Login"
              : "No account? Register"}
          </button>
        </>
      )}
    </div>
  );
}

export default App;
