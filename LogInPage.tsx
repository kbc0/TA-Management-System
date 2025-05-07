// 🔗 Backend'e gönderilecek ID ve şifre kontrolü burada yapılmalı on line 29
// 🔄 Geçici mock veriler — ileride backend'e bağlanacak on line 19
// ✅ Giriş başarılıysa yönlendirme burada yapılacak on line 39
// 🧭 Forgot password sayfasına yönlendirme burada yapılacak on line 99

import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // En üste ekle
import "./LogInPage.css";

interface User {
  id: string;
  password: string;
  role: 'admin' | 'TA' | 'staff';
}

const LoginPage: React.FC = () => {
  const [bilkentID, setBilkentID] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorID, setErrorID] = useState<string>("");
  const [errorPassword, setErrorPassword] = useState<string>("");
  const navigate = useNavigate(); // Fonksiyon içinde tanımla

  // 🔄 Geçici mock veriler — ileride backend'e bağlanacak
  const mockData: User[] = [
    { id: '21900000', password: 'pass123', role: 'admin' },
    { id: '22103567', password: '123', role: 'TA' },
    { id: '21900002', password: 'test789', role: 'staff' }
  ];

  const handleLogin = (): void => {
    setErrorID("");
    setErrorPassword("");

    // 🔗 Backend'e gönderilecek ID ve şifre kontrolü burada yapılmalı
    const user = mockData.find((user) => user.id === bilkentID);

    if (!user) {
      setErrorID("Incorrect Bilkent ID");
    } else if (user.password !== password) {
      setErrorPassword("Incorrect Password");
    } else {
      console.log("Login successful!");
      // ✅ Giriş başarılıysa yönlendirme burada yapılacak

      // 🎯 Kullanıcının rolüne göre yönlendirme yapılacak
  switch (user.role) {
    case 'admin':
      // 🔗 Admin için homepage'e yönlendirme
      console.log("Redirecting to Admin HomePage...");
      break;
    case 'TA':
      // 🔗 TA için homepage'e yönlendirme
      console.log("Redirecting to TA HomePage...");
      navigate("/ta-home");
      break;
    case 'staff':
      // 🔗 Staff için homepage'e yönlendirme
      console.log("Redirecting to Staff HomePage...");
      break;
    default:
      // ❗ Tanımsız rol
      console.log("Unknown user role.");
  }

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
        <h2 className="login-title">TA Management System</h2>

        <div className="input-group">
          <label>Bilkent ID</label>
          <input
            type="text"
            placeholder="Enter your Bilkent ID"
            value={bilkentID}
            onChange={(e) => setBilkentID(e.target.value)}
            className={errorID ? "input-error" : ""}
          />
          {errorID && <p className="error-text">{errorID}</p>}
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errorPassword ? "input-error" : ""}
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
          {errorPassword && <p className="error-text">{errorPassword}</p>}
        </div>

        <button className="login-button" onClick={handleLogin}>
          Login
        </button>

        <button
          className="forgot-password"
          onClick={() => {
            // 🧭 Forgot password sayfasına yönlendirme burada yapılacak
            
              navigate("/forgot-password");
            console.log("Redirecting to Forgot Password page...");
          }}
        >
          Forgot Password?
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
