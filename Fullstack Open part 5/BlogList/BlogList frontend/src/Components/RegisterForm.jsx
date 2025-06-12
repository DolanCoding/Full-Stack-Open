import React, { useState } from "react";

function RegisterForm({ onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister({ username, password });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="auth-form"
      data-testid="register-form"
    >
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        data-testid="register-username-input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        data-testid="register-password-input"
      />
      <button type="submit" data-testid="register-btn">
        Register
      </button>
    </form>
  );
}

export default RegisterForm;
