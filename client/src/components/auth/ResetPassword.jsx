import React from "react";

const ResetPassword = () => {
  return (
    <div className="auth-container">
      <div className="title">
        <h2>Forgot Password</h2>
        <p>reset your password</p>
      </div>
      <div className="info">
        <p>
          We've sent a reset token to your email. Please enter it below to reset
          your password
        </p>
      </div>
      <form>
        <label htmlFor="email">Reset Token</label>
        <input
          type="text"
          name="email"
          placeholder="Enter your reset token"
          autoComplete="off"
        />

        <div className="grp-container">
          <div className="sub-container">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
            />
          </div>

          <div className="sub-container">
            <label htmlFor="cnfm-password">Confirm Password</label>
            <input
              type="password"
              name="cnfm-password"
              placeholder="Confirm Password"
            />
          </div>
        </div>

        <button type="submit">Send Reset Token</button>
      </form>

      <p className="link">
        Back to Login? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default ResetPassword;
