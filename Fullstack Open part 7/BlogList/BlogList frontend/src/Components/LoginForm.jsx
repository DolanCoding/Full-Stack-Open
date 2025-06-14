import React, { useState } from "react";

function LoginForm({ onLogin, onToggleRegister }) {
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
      className="auth-form login-form"
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
      <label>
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
      {onToggleRegister && (
        <button
          type="button"
          className="toggle-auth-btn"
          onClick={onToggleRegister}
        >
          No account? Register
        </button>
      )}
    </form>
  );
}

export default LoginForm;
