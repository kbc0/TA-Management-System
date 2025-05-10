// src/pages/auth/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./LogInPage.css";

const LoginPage: React.FC = () => {
  const [bilkentID, setBilkentID] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (): Promise<void> => {
    // Reset errors
    setError("");
    
    // Validate input
    if (!bilkentID || !password) {
      setError("Please enter both Bilkent ID and password");
      return;
    }

    try {
      setIsLoading(true);
      // Import the login function from the API
      const { login: loginApi } = await import('../../api/auth');
      
      // Call the login API
      const data = await loginApi({ bilkentId: bilkentID, password });

      // Use the context login function to update auth state (this also handles localStorage)
      login(data.token, data.user);

      // Redirect based on user role
      switch (data.user.role) {
        case 'admin':
          navigate("/admin/home");
          break;
        case 'ta':
          navigate("/ta/home");
          break;
        case 'staff':
          navigate("/staff/home");
          break;
        case 'department_chair':
          navigate("/chair/home");
          break;
        case 'dean':
          navigate("/dean/home");
          break;
        default:
          navigate("/home");
      }
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
          src="/bilkent-logo.png"
          alt="Bilkent Logo"
          className="login-logo"
        />
        <h2 className="login-title">TA Management System</h2>

        <div className="input-group">
          <label>Bilkent ID</label>
          <input
            type="text"
            placeholder="Enter your Bilkent ID"
            value={bilkentID}
            onChange={(e) => setBilkentID(e.target.value)}
            className={error ? "input-error" : ""}
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
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
          {error && <p className="error-text">{error}</p>}
        </div>

        <button 
          className="login-button" 
          onClick={handleLogin} 
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <button
          className="forgot-password"
          onClick={() => navigate("/forgot-password")}
          disabled={isLoading}
        >
          Forgot Password?
        </button>
        
        <div style={{ marginTop: '20px' }}>
          <span style={{ fontSize: '14px' }}>Don't have an account? </span>
          <button
            className="forgot-password"
            onClick={() => navigate("/signup")}
            style={{ marginTop: '0' }}
            disabled={isLoading}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
