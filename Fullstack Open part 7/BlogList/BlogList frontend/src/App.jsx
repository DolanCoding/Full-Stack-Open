import { useState, useEffect, useRef } from "react";
import "./style.css";
import BlogForm from "./Components/BlogForm";
import BlogList from "./Components/BlogList";
import LoginForm from "./Components/LoginForm";
import RegisterForm from "./Components/RegisterForm";
import Notification from "./Components/Notification";
import Togglable from "./Components/Togglable";
import { useSelector, useDispatch } from "react-redux";
import { clearNotification } from "./store/uiSlice";
import { fetchBlogs } from "./store/blogsSlice";
import { setUser, clearUser } from "./store/userSlice";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UsersList from "./Components/UsersList";
import UserView from "./Components/UserView";
import BlogView from "./Components/BlogView";

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const notification = useSelector((state) => state.ui.notification);
  const dispatch = useDispatch();
  const blogFormRef = useRef();
  const blogs = useSelector((state) => state.blogs);
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);

  // Fetch blogs from backend
  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  useEffect(() => {
    // Restore user from localStorage if present
    const savedUser = localStorage.getItem("bloglistUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        dispatch(setUser({ user: parsed, token: parsed.token }));
      } catch (e) {
        console.log(e);
      }
    }
  }, [dispatch]);

  const showNotification = (message, type = "success") => {
    dispatch({ type: "ui/setNotification", payload: { message, type } });
    setTimeout(() => dispatch(clearNotification()), 4000);
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
        dispatch(fetchBlogs());
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
    dispatch(fetchBlogs());
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
        dispatch(setUser({ user: data, token: data.token }));
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
    dispatch(clearUser());
    localStorage.removeItem("bloglistUser");
  };

  return (
    <Router>
      <div className="app-container">
        <Notification message={notification.message} type={notification.type} />
        <header className="app-header">
          <nav className="main-nav">
            <Link to="/" className="nav-link">
              Blogs
            </Link>
            <Link to="/users" className="nav-link">
              Users
            </Link>
            {user && (
              <span className="logged-in-user" data-testid="logged-in-user">
                Logged in as <b>{user.username}</b>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </span>
            )}
          </nav>
        </header>
        <h1>Blog List</h1>
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <>
                  <Togglable
                    buttonLabel="Create new blog"
                    buttonClassName="create-blog-btn"
                    ref={blogFormRef}
                  >
                    {() => (
                      <BlogForm
                        onCreate={(blogData, resetForm) => {
                          fetch("http://localhost:3003/api/blogs", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              ...(token && {
                                Authorization: `Bearer ${token}`,
                              }),
                            },
                            body: JSON.stringify(blogData),
                          })
                            .then((res) => {
                              if (!res.ok)
                                throw new Error(
                                  "Unauthorized or error creating blog"
                                );
                              return res.json();
                            })
                            .then((createdBlog) => {
                              dispatch(fetchBlogs());
                              showNotification(
                                `A new blog '${createdBlog.title}' by ${createdBlog.author} added!`,
                                "success"
                              );
                              resetForm();
                              if (blogFormRef.current)
                                blogFormRef.current.hide();
                            })
                            .catch((err) =>
                              showNotification(err.message, "error")
                            );
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
                    <LoginForm
                      onLogin={handleLogin}
                      onToggleRegister={() => setShowRegister(true)}
                    />
                  )}
                </>
              )
            }
          />
          <Route path="/users" element={<UsersList />} />
          <Route path="/users/:id" element={<UserView />} />
          <Route path="/blogs/:id" element={<BlogView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
