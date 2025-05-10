// src/pages/auth/SignupPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../auth/LogInPage.css"; // Reuse the login CSS

const SignupPage: React.FC = () => {
  const [bilkentId, setBilkentId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSignup = async (): Promise<void> => {
    // Reset error
    setError("");

    // Validation
    if (!bilkentId || !email || !fullName || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!email.endsWith('@bilkent.edu.tr')) {
      setError("Please use your Bilkent email address");
      return;
    }

    try {
      setIsLoading(true);
      // Import the signup function from the API
      const { signup: signupApi } = await import('../../api/auth');
      
      // Call the signup API
      const data = await signupApi({
        bilkentId,
        email,
        fullName,
        password,
        role: 'ta' // Default role
      });

      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to the appropriate dashboard
      navigate('/ta/dashboard');
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
      <div className="login-box" style={{ width: '400px' }}>
        <img
          src="/bilkent-logo.jpg"
          alt="Bilkent Logo"
          className="login-logo"
        />
        <h2 className="login-title">Sign Up</h2>

        <div className="input-group">
          <label>Bilkent ID</label>
          <input
            type="text"
            placeholder="Enter your Bilkent ID"
            value={bilkentId}
            onChange={(e) => setBilkentId(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your Bilkent email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
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
          <label>Confirm Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button 
          className="login-button" 
          onClick={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>

        <div style={{ marginTop: '20px' }}>
          <span style={{ fontSize: '14px' }}>Already have an account? </span>
          <button
            className="forgot-password"
            onClick={() => navigate("/")}
            style={{ marginTop: '0' }}
            disabled={isLoading}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
