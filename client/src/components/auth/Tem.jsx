import React, { useState } from "react";

const Tem = () => {
  const [step, setStep] = useState(1);
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div className="auth-container">
      <div className="title">
        <h2>Create Account</h2>
        <p>Join our courier network</p>
      </div>

      <form>
        {step == 1 && (
          <>
            <div className="grp-container">
              <div className="sub-container">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter firstname"
                  autoComplete="off"
                />
              </div>

              <div className="sub-container">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter lastname"
                  autoComplete="off"
                />
              </div>
            </div>

            <label htmlFor="email">Email Address</label>
            <input
              type="text"
              name="email"
              placeholder="Enter your email"
              autoComplete="off"
            />
          </>
        )}

        {step == 2 && (
          <>
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Enter phone number"
              autoComplete="off"
            />

            <label htmlFor="address">Address</label>
            <input
              type="text"
              name="address"
              placeholder="Enter Full Address"
              autoComplete="off"
            />
          </>
        )}

        {step == 3 && (
          <>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
            />

            <label htmlFor="cnfm-password">Confirm Password</label>
            <input
              type="password"
              name="cnfm-password"
              placeholder="Confirm Password"
            />
          </>
        )}

        <div className="navigation-btns">
            {step > 1 && (
                <button id="prev" className="nav-btn" onClick={prevStep}>previous</button>
            )}

            {step < 3 && (
                <button id="next" className="nav-btn" onClick={nextStep}>next</button>
            )}

            {step == 3 && (
                <button id="submit" className="nav-btn" type="submit">Sign up</button>
            )}
        </div>
      </form>
    </div>
  );
};

export default Tem;
