import React, { useState } from "react";

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ username, password, remember });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="auth-form"
      data-testid="login-form"
    >
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        data-testid="login-username-input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        data-testid="login-password-input"
      />
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5em",
          marginBottom: "1em",
        }}
      >
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          data-testid="login-remember-checkbox"
        />
        Remember me
      </label>
      <button type="submit" data-testid="login-btn">
        Login
      </button>
    </form>
  );
}

export default LoginForm;
