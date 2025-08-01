// import React, { useState } from "react";
// import "./Signup.css";

// const Signup = () => {
//   const [step, setStep] = useState(1);
//   // const nextStep = () => setStep((prev) => prev + 1);
//   const prevStep = () => setStep((prev) => prev - 1);

//   const nextStep = () => {
//     setStep((prev) => prev + 1);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//   };

//   return (
//     <div className="auth-container">
//       <div className="title">
//         <h2>Create Account</h2>
//         <p>Join our courier network</p>
//       </div>

// <div className="progresive-bar">
//   {[
//     { step: 1, label: "Personal Info" },
//     { step: 2, label: "Contact Info" },
//     { step: 3, label: "Security" },
//   ].map((item, index) => (
//     <React.Fragment key={item.step}>
//       <div className="step-container">
//         <div
//           className={`num ${
//             step === item.step ? "active" : step > item.step ? "complete" : ""
//           }`}
//         >
//           {item.step}
//         </div>
//         <div className="step-label">{item.label}</div>
//       </div>
//       {index < 2 && (
//         <div className={`bar ${step > item.step ? "complete" : ""}`}></div>
//       )}
//     </React.Fragment>
//   ))}
// </div>


//       <form onSubmit={handleSubmit}>
//         {step === 1 && (
//           <>
//             <div className="grp-container">
//               <div className="sub-container">
//                 <label htmlFor="firstName">First Name</label>
//                 <input
//                   type="text"
//                   name="firstName"
//                   placeholder="Enter firstname"
//                   autoComplete="off"
//                 />
//               </div>

//               <div className="sub-container">
//                 <label htmlFor="lastName">Last Name</label>
//                 <input
//                   type="text"
//                   name="lastName"
//                   placeholder="Enter lastname"
//                   autoComplete="off"
//                 />
//               </div>
//             </div>

//             <label htmlFor="email">Email Address</label>
//             <input
//               type="text"
//               name="email"
//               placeholder="Enter your email"
//               autoComplete="off"
//             />
//           </>
//         )}

//         {step === 2 && (
//           <>
//             <label htmlFor="phoneNumber">Phone Number</label>
//             <input
//               type="tel"
//               name="phoneNumber"
//               placeholder="Enter phone number"
//               autoComplete="off"
//             />

//             <label htmlFor="address">Address</label>
//             <textarea
//               name="address"
//               id="address-field"
//               placeholder="Enter Full Address"
//             ></textarea>
//           </>
//         )}

//         {step === 3 && (
//           <>
//             <label htmlFor="password">Password</label>
//             <input
//               type="password"
//               name="password"
//               placeholder="Enter password"
//             />

//             <label htmlFor="cnfm-password">Confirm Password</label>
//             <input
//               type="password"
//               name="cnfm-password"
//               placeholder="Confirm Password"
//             />
//           </>
//         )}

//         <div className="navigation-btns">
//           {step > 1 && (
//             <button id="prev" className="nav-btn" onClick={prevStep}>
//               Previous
//             </button>
//           )}

//           {step < 3 && (
//             <button id="next" className="nav-btn" onClick={nextStep}>
//               Next
//             </button>
//           )}

//           {step === 3 && (
//             <button id="submit" className="nav-btn" type="submit">
//               Sign up
//             </button>
//           )}
//         </div>

//         <p className="link">
//           Already have an account? <a href="/login">Login</a>
//         </p>
//       </form>
//     </div>
//   );
// };

// export default Signup;




import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:4000/api/auth/signup", {
        first_name: formData.firstName,
        last_name: formData.lastName,
        full_name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phoneNumber,
        address: formData.address,
        password: formData.password,
      });

      alert(res.data.message);
      navigate('/login');
      setStep(1);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create account");
    }
  };

  return (
    <div className="auth-container">
      <div className="title">
        <h2>Create Account</h2>
        <p>Join our courier network</p>
      </div>

      <div className="progresive-bar">
        {[
          { step: 1, label: "Personal Info" },
          { step: 2, label: "Contact Info" },
          { step: 3, label: "Security" },
        ].map((item, index) => (
          <React.Fragment key={item.step}>
            <div className="step-container">
              <div
                className={`num ${
                  step === item.step ? "active" : step > item.step ? "complete" : ""
                }`}
              >
                {item.step}
              </div>
              <div className="step-label">{item.label}</div>
            </div>
            {index < 2 && (
              <div className={`bar ${step > item.step ? "complete" : ""}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            <div className="grp-container">
              <div className="sub-container">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter firstname"
                  autoComplete="off"
                />
              </div>

              <div className="sub-container">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter lastname"
                  autoComplete="off"
                />
              </div>
            </div>

            <label htmlFor="email">Email Address</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="off"
            />
          </>
        )}

        {step === 2 && (
          <>
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              autoComplete="off"
            />

            <label htmlFor="address">Address</label>
            <textarea
              name="address"
              id="address-field"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter Full Address"
            ></textarea>
          </>
        )}

        {step === 3 && (
          <>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
            />

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
            />
          </>
        )}

        <div className="navigation-btns">
          {step > 1 && (
            <button type="button" id="prev" className="nav-btn" onClick={prevStep}>
              Previous
            </button>
          )}

          {step < 3 && (
            <button type="button" id="next" className="nav-btn" onClick={nextStep}>
              Next
            </button>
          )}

          {step === 3 && (
            <button id="submit" className="nav-btn" type="submit">
              Sign up
            </button>
          )}
        </div>

        <p className="link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
