// src/pages/auth/ForgotPasswordPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../auth/LogInPage.css"; // Reuse the login CSS

const ForgotPasswordPage: React.FC = () => {
  const [bilkentId, setBilkentId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (): Promise<void> => {
    // Reset messages
    setError("");
    setMessage("");

    // Validation
    if (!bilkentId) {
      setError("Please enter your Bilkent ID");
      return;
    }

    try {
      setIsLoading(true);
      // Call the backend API
      const response = await fetch('http://localhost:5001/api/auth/recover-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bilkentId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password recovery failed');
      }

      setMessage("If your ID exists, a password reset link has been sent to your email");
      // After a delay, redirect to login
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-background">
      <div className="login-box">
        <img
          src="/bilkent-logo.jpg"
          alt="Bilkent Logo"
          className="login-logo"
        />
        <h2 className="login-title">Recover Password</h2>

        <div className="input-group">
          <label>Bilkent ID</label>
          <input
            type="text"
            placeholder="Enter your Bilkent ID"
            value={bilkentId}
            onChange={(e) => setBilkentId(e.target.value)}
            className={error ? "input-error" : ""}
          />
        </div>

        {error && <p className="error-text">{error}</p>}
        {message && <p style={{ color: 'green', marginBottom: '15px' }}>{message}</p>}

        <button 
          className="login-button" 
          onClick={handleSubmit}
          disabled={isLoading || message !== ""}
        >
          {isLoading ? "Sending..." : "Reset Password"}
        </button>

        <button
          className="forgot-password"
          onClick={() => navigate("/")}
          disabled={isLoading}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
