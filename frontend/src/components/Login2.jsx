import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Login.css";
import { environment } from "../../utlis/environment.js";

const Login2 = ({ newUser, setNotification }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const nav = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${environment.url}/api/employee/empLogin`, {
        method: "POST",
        headers: {
          "x-tenant-id": environment.tenantId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        localStorage.setItem("token", data.token);
        newUser(data.emp);
        nav("/");
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <section className="login-form-container">
        <h2>Employee Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group login-form">
            <div className="inline-item">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="inline-item">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
          <button type="submit" className="submit-btn">
            Login
          </button>
        </form>
        <div className="ex-login">
          <p>
            Don't have an accout?{" "}
            <span>
              <Link to="/emp-register">Register here</Link>
            </span>
          </p>
        </div>
      </section>
    </>
  );
};

export default Login2;
