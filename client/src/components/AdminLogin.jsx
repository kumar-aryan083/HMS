import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';

const AdminLogin = () => {

    const {setNotification, user, newUser} = useContext(AppContext);
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const nav = useNavigate();

    useEffect(()=>{
        document.title = "Admin Login | HMS";
        if(user){
            nav('/');
        }
    },[user])

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:8000/api/admin/admin-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setNotification(data.message);
                localStorage.setItem("token", data.token);
                newUser(data.admin);
                nav('/');
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <section className="login-form-container">
                <h2>Admin Login</h2>
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
                    <button type="submit" className="submit-btn">Login</button>
                </form>
            </section>
        </>
    );
}

export default AdminLogin;
