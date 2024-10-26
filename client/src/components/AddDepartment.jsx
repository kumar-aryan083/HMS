import React, { useEffect, useState } from 'react';
import './styles/AddDepartment.css';
import { useNavigate } from 'react-router-dom';

const AddDepartment = ({ setNotification, user }) => {
    const nav = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        headOfDepartment: '',
        servicesOffered: '',
    });

    useEffect(()=>{
        if(!user || !user.isAdmin){
            setNotification("Login as a admin to acces this page.")
            nav('/');
        }
    },[user])

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { name, location, headOfDepartment, servicesOffered } = formData;
            const services = servicesOffered.split(',').map(service => service.trim());

            const requestBody = {
                name,
                location,
                headOfDepartment,
                servicesOffered: services
            };

            const res = await fetch('http://localhost:8000/api/admin/add-department', {
                method: "POST",
                headers:{
                    "Content-Type": 'application/json',
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify(requestBody)
            });
            const data = await res.json();
            if(res.ok){
                setNotification(data.message);
                setFormData({ name: '', location: '', headOfDepartment: '', servicesOffered: '' });
            }else{
                setNotification(data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <div className="department-form-container">
                <h2 className="department-form-headline">Add Department</h2>

                <form onSubmit={handleSubmit}>
                    <div className="department-form-group">
                        <label htmlFor="name">Department Name<span className="required">*</span></label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="department-form-group">
                        <label htmlFor="location">Location<span className="required">*</span></label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="department-form-group">
                        <label htmlFor="headOfDepartment">Head of Department</label>
                        <input
                            type="text"
                            id="headOfDepartment"
                            name="headOfDepartment"
                            value={formData.headOfDepartment}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="department-form-group">
                        <label htmlFor="servicesOffered">Services Offered (comma separated)</label>
                        <input
                            type="text"
                            id="servicesOffered"
                            name="servicesOffered"
                            value={formData.servicesOffered}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="submit-department-btn">Add Department</button>
                </form>
            </div>
        </>
    );
}

export default AddDepartment;
