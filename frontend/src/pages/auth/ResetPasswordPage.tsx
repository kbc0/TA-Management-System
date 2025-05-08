// src/pages/auth/ResetPasswordPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../auth/LogInPage.css"; // Reuse the login CSS

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [bilkentId, setBilkentId] = useState<string>("");
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get token and ID from the URL
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    const resetToken = location.pathname.split('/')[2]; // Assuming the URL is /reset-password/:token
    
    if (!id || !resetToken) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }
    
    setBilkentId(id);
    setToken(resetToken);
  }, [location]);

  const handleSubmit = async (): Promise<void> => {
    // Reset messages
    setError("");
    setMessage("");

    // Validation
    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsLoading(true);
      // Call the backend API
      const response = await fetch('http://localhost:5001/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          bilkentId,
          newPassword: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      setMessage("Password has been reset successfully. Redirecting to login...");
      // After a delay, redirect to login
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="login-background">
      <div className="login-box">
        <img
          src="/bilkent-logo.jpg"
          alt="Bilkent Logo"
          className="login-logo"
        />
        <h2 className="login-title">Reset Password</h2>

        {error && error.includes("Invalid reset link") ? (
          <div>
            <p className="error-text">{error}</p>
            <button
              className="login-button"
              onClick={() => navigate("/forgot-password")}
              style={{ marginTop: '20px' }}
            >
              Request New Link
            </button>
          </div>
        ) : (
          <>
            <div className="input-group">
              <label>New Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={error ? "input-error" : ""}
                />
                <span
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                  role="button"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            <div className="input-group">
              <label>Confirm New Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={error ? "input-error" : ""}
                />
              </div>
            </div>

            {error && <p className="error-text">{error}</p>}
            {message && <p style={{ color: 'green', marginBottom: '15px' }}>{message}</p>}

            <button 
              className="login-button" 
              onClick={handleSubmit}
              disabled={isLoading || message !== ""}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        <button
          className="forgot-password"
          onClick={() => navigate("/")}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
