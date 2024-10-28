import React, { useEffect, useState } from 'react';
import './styles/Appointment.css';
import { useNavigate } from 'react-router-dom';

const Appointment = ({ setNotification, user }) => {
  const nav = useNavigate();
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    doctor: '',
    department: '',
    appointmentDate: '',
    appointmentTime: {
      from: '',
      to: ''
    },
    reason: '',
    phone: '',
    gender: '',
    height: '',
    weight: '',
    age: ''
  });
  
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [departmentsResponse, doctorsResponse] = await Promise.all([
          fetch('http://localhost:8000/api/admin/get-departments', {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem('token')
            }
          }),
          fetch('http://localhost:8000/api/employee/get-doctors', {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem('token')
            }
          })
        ]);

        if (!departmentsResponse.ok || !doctorsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const departmentsData = await departmentsResponse.json();
        const doctorsData = await doctorsResponse.json();

        setDepartmentList(departmentsData.departments);
        setDoctorList(doctorsData.doctors);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!user) {
      nav('/');
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handlePatientSearch = async (query) => {
    if (query.length < 3) return; // Avoid sending requests for short queries
    try {
      const response = await fetch(`http://localhost:8000/api/patient/search?name=${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem('token')
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch patient suggestions');
      }
      const data = await response.json(); // Assume the response is JSON
      setPatientSuggestions(data.patients || []); // Use a fallback to an empty array
    } catch (error) {
      console.error('Error fetching patient suggestions:', error);
      setPatientSuggestions([]); // Clear suggestions on error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      const res = await fetch("http://localhost:8000/api/patient/book-appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem('token')
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setFormData({
          patientId: '',
          patientName: '',
          doctor: '',
          department: '',
          appointmentDate: '',
          appointmentTime: {
            from: '',
            to: ''
          },
          reason: ''
        })
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div className="appointment-form-container">
        <h2 className="appointment-form-heading">Book Appointment</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-pair">
            <div className="appointment-form-group">
              <label>Patient Name <span className="required">*</span></label>
              <div className="patient-search-container">
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={(e) => {
                    handleChange(e);
                    handlePatientSearch(e.target.value);
                  }}
                  required
                />
                {patientSuggestions.length > 0 && (
                  <div className="suggestions-list">
                    {patientSuggestions.map((patient) => (
                      <div
                        key={patient._id}
                        className="suggestion-item"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev, patientId: patient._id, patientName: patient.patientName, phone: patient.mobile,
                            gender: patient.gender, age: patient.age, height: patient.height, weight: patient.weight
                          }));
                          setPatientSuggestions([]); // Clear suggestions when one is selected
                        }}
                      >
                        {patient.patientName}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="appointment-form-group">
              <label>Doctor <span className="required">*</span></label>
              <select
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                required
              >
                <option value="">Select Doctor</option>
                {doctorList.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-pair">
            <div className="appointment-form-group">
              <label>Gender <span className="required">*</span></label>
              <input
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                readOnly
              />
            </div>

            <div className="appointment-form-group">
              <label>Phone <span className="required">*</span></label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                readOnly
              />
            </div>
          </div>

          <div className="input-pair">
            <div className="appointment-form-group">
              <label>Age <span className="required">*</span></label>
              <input
                name="age"
                value={formData.age}
                onChange={handleChange}
                readOnly
              />
            </div>

            <div className="appointment-form-group">
              <label>Height (in cm)</label>
              <input
                type="text"
                name="height"
                value={formData.height}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="appointment-form-group">
              <label>Weight (in kg)</label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                readOnly
              />
            </div>
          </div>
          <div className="input-pair">
            <div className="appointment-form-group">
              <label>Department <span className="required">*</span></label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                {departmentList.map((department) => (
                  <option key={department._id} value={department._id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="appointment-form-group">
              <label>Appointment Date <span className="required">*</span></label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>


          <div className="input-pair">
            <div className="appointment-form-group">
              <label>Appointment Time <span className="required">*</span></label>
              <div className="input-pair">
                <input
                  type="time"
                  name="from"
                  value={formData.appointmentTime.from}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      appointmentTime: { ...prevData.appointmentTime, from: e.target.value },
                    }))
                  }
                  required
                />
                <input
                  type="time"
                  name="to"
                  value={formData.appointmentTime.to}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      appointmentTime: { ...prevData.appointmentTime, to: e.target.value },
                    }))
                  }
                  required
                />
              </div>

            </div>
            <div className="appointment-form-group">
              <label>Reason <span className="required">*</span></label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="appointment-submit-btn">Book Appointment</button>
        </form>
      </div>
    </>
  );
}

export default Appointment;
