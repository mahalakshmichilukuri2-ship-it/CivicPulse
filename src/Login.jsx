

import { useState } from 'react';
import './App.css';

function Login({ onLogin }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Citizen');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    onLogin({ name: name.trim(), role });
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <i className="bi bi-geo-alt-fill"></i>
          </div>

          <h2>CivicPulse</h2>
          <p>Welcome to your community dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="loginName" className="form-label">
              Your Name
            </label>

            <input
              id="loginName"
              className="form-control login-input"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError('');
              }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="loginRole" className="form-label">
              Choose Role
            </label>

            <select
              id="loginRole"
              className="form-select login-input"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="Citizen">Citizen</option>
              <option value="Admin">Admin Demo</option>
            </select>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="login-button">
            Continue <i className="bi bi-arrow-right ms-2"></i>
          </button>
        </form>

        <div className="login-demo">
          <span className="badge rounded-pill text-bg-light">
            <i className="bi bi-info-circle me-1"></i>
            Demo Mode
          </span>

          <p>
            Experience CivicPulse as a Citizen or Admin.
          </p>
        </div>
      </div>

      <p className="login-footer">
        Building cleaner, safer communities together.
      </p>
    </main>
  );
}

export default Login;
