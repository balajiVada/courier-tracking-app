// import React from "react";
// import "./Login.css";

// const Login = () => {
//   return (
//     <div className="auth-container">
//       <div className="title">
//         <h2>Welcome Back</h2>
//         <p>Sign in to your account</p>
//       </div>
//       <form>
//         <label htmlFor="email">Email Address</label>
//         <input type="text" name="email" placeholder="Enter your email" autoComplete="off" />

//         <label htmlFor="password">Password</label>
//         <input type="password" name="password" placeholder="Enter your password" />

//         <button type="submit">Login</button>
//       </form>
//       <p className="link"><a href="/forgotpassword">Forgot Password?</a></p>
//       <p className="link">
//         Don't have an account? <a href="/signup">Sign up</a>
//       </p>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:4000/api/auth/login",
        formData
      );
      alert(res.data.message);
      // localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("user_id", res.data.user.id);
      login(res.data.user.id);
      navigate("/landingpage");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="title">
        <h2>Welcome Back</h2>
        <p>Sign in to your account</p>
      </div>

      <form onSubmit={handleLogin}>
        <label htmlFor="email">Email Address</label>
        <input
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          autoComplete="off"
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
        />

        <button type="submit">Login</button>
      </form>

      <p className="link">
        <a href="/forgotpassword">Forgot Password?</a>
      </p>
      <p className="link">
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
};

export default Login;
