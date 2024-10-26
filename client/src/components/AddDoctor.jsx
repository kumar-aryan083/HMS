import React, { useEffect, useState } from 'react';
import './styles/AddDoctor.css';
import { useNavigate } from 'react-router-dom';

const AddDoctor = ({ setNotification, user }) => {
  const nav = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    qualifications: '',
    experienceYears: '',
    department: '',
    availableDays: [],
    availableTime: { from: '', to: '' }
  });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    document.title = "Add Doctor | HMS";
    fetchDepartments();
  }, []);
  useEffect(()=>{
    if(!user || !user.isAdmin){
      setNotification("Login as admin to access this page");
      nav('/');
    }
  },[user])

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/get-departments', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setDepartments(data.departments);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  const handleAvailableDaysChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      availableDays: checked
        ? [...prevData.availableDays, value]
        : prevData.availableDays.filter(day => day !== value)
    }));
  };

  const handleDepartmentChange = (e) => {
    const selectedDepartment = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      department: selectedDepartment
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      const { name, email, phone, specialization, qualifications, experienceYears, department, availableDays, availableTime } = formData;

      const requestBody = {
        name,
        email,
        phone,
        specialization,
        qualifications: qualifications.split(',').map(qual => qual.trim()),
        experienceYears,
        department,
        availableDays,
        availableTime
      };

      const res = await fetch('http://localhost:8000/api/admin/add-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem('token')
        },
        body: JSON.stringify(requestBody)
      });

      const data = await res.json();
      if (res.ok) {
        setFormData({ name: '', email: '', phone: '', specialization: '', qualifications: '', experienceYears: '', department: '', availableDays: [], availableTime: { from: '', to: '' } });
        setNotification(data.message);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <div className="doctor-form-container">
        <h2 className="doctor-form-heading">Add New Doctor</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-pair">
            <div className="doctor-form-group">
              <label>Name <span className="required">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="doctor-form-group">
              <label>Email <span className="required">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-pair">
            <div className="doctor-form-group">
              <label>Phone <span className="required">*</span></label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="doctor-form-group">
              <label>Specialization <span className="required">*</span></label>
              <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} required />
            </div>
          </div>

          <div className="doctor-form-group">
            <label>Qualifications (comma-separated) <span className="required">*</span></label>
            <input type="text" name="qualifications" value={formData.qualifications} onChange={handleChange} required />
          </div>

          <div className="input-pair">
            <div className="doctor-form-group">
              <label>Experience (Years) <span className="required">*</span></label>
              <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} required />
            </div>
            <div className="doctor-form-group">
              <label>Department <span className="required">*</span></label>
              <select value={formData.department} onChange={handleDepartmentChange} required>
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="input-pair">
            <div className="doctor-form-group">
              <label>Available Days <span className="required">*</span></label>
              <div className="available-days-container">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <label key={day} className="day-checkbox">
                    <input type="checkbox" value={day} checked={formData.availableDays.includes(day)} onChange={handleAvailableDaysChange} />
                    {day}
                  </label>
                ))}
              </div>
            </div>

            <div className="doctor-form-group">
              <label>Available Time <span className="required">*</span></label>
              <div className="inline-time">
                <div className="inline-time-item">
                  <label>From</label>
                  <input
                    type="time"
                    name="from"
                    value={formData.availableTime.from}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        availableTime: { ...prevData.availableTime, from: e.target.value }
                      }))
                    }
                    required
                  />
                </div>
                <div className="inline-time-item">
                  <label>To</label>
                  <input
                    type="time"
                    name="to"
                    value={formData.availableTime.to}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        availableTime: { ...prevData.availableTime, to: e.target.value }
                      }))
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </div>



          <button type="submit" className="doctor-submit-btn">Add Doctor</button>
        </form>
      </div>
    </>
  );
}

export default AddDoctor;
