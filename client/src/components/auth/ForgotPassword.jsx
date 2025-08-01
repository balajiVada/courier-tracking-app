import React from 'react'
import './ForgotPassword.css';

const ForgotPassword = () => {
  return (
        <div className='auth-container'>
        <div className="title">
            <h2>Forgot Password</h2>
            <p>reset your password</p>
        </div>
        <div className="info">
            <p>Enter your email and we'll send you a token to reset your password</p>
        </div>
         <form>
        <label htmlFor="email">Email Address</label>
        <input type="text" name="email" placeholder="Enter your email" autoComplete="off" />
    
        
        <button type="submit">Send Reset Token</button>
      </form>

       <p className="link">
        Back to Login? <a href="/login">Login</a>
      </p>
    </div>
  )
}

export default ForgotPassword