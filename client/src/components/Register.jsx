import React, { useEffect, useState } from 'react';
import './styles/Register.css';
import { Link, useNavigate } from 'react-router-dom';

const Register = ({newUser, setNotification}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    cnfPassword: '',
    dept: ''
  });
  const nav = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(formData);
    try {
      const res = await fetch("http://localhost:8000/api/employee/empRegister",{
        method: "POST",
        headers:{
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if(res.ok){
        setNotification(data.message);
        localStorage.setItem("token", data.token);
        newUser(data.newEmployee);
        nav('/');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <section className="form-container r-form">
                <h2>Employee Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group inline">
                        <div className="inline-item">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="inline-item">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-group inline">
                    <div className="inline-item">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="inline-item">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="cnfPassword"
                                value={formData.cnfPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <button type="submit" className="submit-btn">Register</button>
                </form>
                <div className="ex-register">
                    <p>Already have an accout? <span><Link to='/emp-login'>Login here</Link></span></p>
                </div>
            </section>
    </>
  );
};

export default Register;
