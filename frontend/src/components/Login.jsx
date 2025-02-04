import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import { environment } from "../../utlis/environment.js";
import './styles/Login.css';

const Login = () => {
  const { setNotification, user, newUser } = useContext(AppContext);

  const [formData, setFormData] = useState({
    role: "",
    email: "",
    password: "",
  });
  const nav = useNavigate();

  useEffect(() => {
    document.title = "Login | HMS";
    if (user) {
      nav("/");
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${environment.url}/api/admin/login-${formData.role}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        localStorage.setItem("token", data.token);
        newUser(data.user);
        nav("/");
      }else{
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <section className="login-form-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="login-form-row fg-group">
            <div className="login-form-group">
              <label>Role</label>
              <select name="role" id="login-role" onChange={handleChange}>
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                {/* <option value="doctor">Doctor</option> */}
                <option value="nurse">Nurse</option>
                <option value="counter">Counter</option>
                <option value="store">Store</option>
                <option value="laboratory">Laboratory</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="hr">HR</option>
                {/*<option value="inventory">Inventory</option> */}
              </select>
            </div>
            <div className="login-form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="login-form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" >
            Login
          </button>
        </form>
        {/* <div className="ex-register">
          <p>
            Already have an accout?{" "}
            <span>
              <Link to="/login">Login here</Link>
            </span>
          </p>
        </div> */}
      </section>
    </>
  );
};

export default Login;
