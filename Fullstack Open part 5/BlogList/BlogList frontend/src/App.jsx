import { useState, useEffect, useRef } from "react";
import "./style.css";
import BlogForm from "./Components/BlogForm";
import BlogList from "./Components/BlogList";
import LoginForm from "./Components/LoginForm";
import RegisterForm from "./Components/RegisterForm";
import Notification from "./Components/Notification";
import Togglable from "./Components/Togglable";

function App() {
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const blogFormRef = useRef();

  // Fetch blogs from backend
  useEffect(() => {
    fetch("http://localhost:3003/api/blogs")
      .then((res) => res.json())
      .then((data) => {
        const sorted = (Array.isArray(data) ? data : []).sort(
          (a, b) => (b.likes ?? 0) - (a.likes ?? 0)
        );
        setBlogs(sorted);
      });
  }, []);

  useEffect(() => {
    // Restore user from localStorage if present
    const savedUser = localStorage.getItem("bloglistUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setToken(parsed.token);
      } catch (e) {
        console.log(e);
      }
    }
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 4000);
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
        showNotification("Blog deleted successfully", "success");
      } else if (res.status === 401) {
        res.json().then((data) => {
          showNotification(
            data.error || "You are not authorized to delete this blog.",
            "error"
          );
        });
      }
    });
  };

  // Whenever blogs are updated, keep them sorted by likes
  const updateBlogs = (updater) => {
    setBlogs((prevBlogs) => {
      const updated = updater(prevBlogs);
      return [...updated].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    });
  };

  const handleLike = (blog) => {
    fetch(`http://localhost:3003/api/blogs/${blog.id || blog._id}/like`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((res) => res.json())
      .then((updatedBlogFromServer) => {
        updateBlogs((prevBlogs) =>
          prevBlogs.map((b) =>
            (b.id || b._id) ===
            (updatedBlogFromServer.id || updatedBlogFromServer._id)
              ? updatedBlogFromServer
              : b
          )
        );
      });
  };

  const handleUnlike = (blog) => {
    fetch(`http://localhost:3003/api/blogs/${blog.id || blog._id}/unlike`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((res) => res.json())
      .then((updatedBlogFromServer) => {
        updateBlogs((prevBlogs) =>
          prevBlogs.map((b) =>
            (b.id || b._id) ===
            (updatedBlogFromServer.id || updatedBlogFromServer._id)
              ? updatedBlogFromServer
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
        showNotification("Registration successful! Please log in.", "success");
      })
      .catch(() => showNotification("Registration failed", "error"));
  };

  const handleLogin = ({ username, password, remember }) => {
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
        if (remember) {
          localStorage.setItem("bloglistUser", JSON.stringify(data));
        } else {
          localStorage.removeItem("bloglistUser");
        }
        showNotification("Login successful!", "success");
      })
      .catch(() => showNotification("Login failed", "error"));
  };

  const handleLogout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("bloglistUser");
  };

  return (
    <div className="app-container">
      <Notification message={notification.message} type={notification.type} />
      <h1>Blog List</h1>
      {user ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <p data-testid="logged-in-user">
              Logged in as <b>{user.username}</b>
            </p>
            <button onClick={handleLogout} style={{ marginLeft: 8 }}>
              Logout
            </button>
          </div>
          <Togglable buttonLabel="Create new blog" ref={blogFormRef}>
            {() => (
              <BlogForm
                onCreate={(blogData, resetForm) => {
                  fetch("http://localhost:3003/api/blogs", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: JSON.stringify(blogData),
                  })
                    .then((res) => {
                      if (!res.ok)
                        throw new Error("Unauthorized or error creating blog");
                      return res.json();
                    })
                    .then((createdBlog) => {
                      setBlogs((prevBlogs) => [
                        createdBlog,
                        ...(Array.isArray(prevBlogs) ? prevBlogs : []),
                      ]);
                      showNotification(
                        `A new blog '${createdBlog.title}' by ${createdBlog.author} added!`,
                        "success"
                      );
                      resetForm();
                      if (blogFormRef.current) blogFormRef.current.hide();
                    })
                    .catch((err) => showNotification(err.message, "error"));
                }}
                onCancel={() =>
                  blogFormRef.current && blogFormRef.current.hide()
                }
              />
            )}
          </Togglable>
          <BlogList
            blogs={blogs}
            onDelete={handleDeleteBlog}
            onLike={handleLike}
            onUnlike={handleUnlike}
            currentUserId={user && (user.id || user._id)}
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
