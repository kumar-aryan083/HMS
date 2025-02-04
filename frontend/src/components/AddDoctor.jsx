import React, { useContext, useEffect, useState } from "react";
import "./styles/AddDoctor.css";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import { environment } from "../../utlis/environment.js";
import { getUserDetails } from "../../utlis/userDetails.js";

const AddDoctor = ({ onClose, onAddDoctor }) => {
  const { setNotification, user } = useContext(AppContext);
  const nav = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    qualifications: "",
    experienceYears: "",
    department: "",
    fees: "",
    availableDays: [],
    availableTime: { from: "", to: "" },
    adhaarNumber: "",
    panNumber: "",
    dateOfBirth: "",
    accNumber: "",
    ifscCode: "",
    accHolderName: "",
    salary: "",
  });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    document.title = "Add Doctor | HMS";
    if (!user || user.role !== "admin") {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/admin/get-departments`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await response.json();
      setDepartments(data.departments);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleAvailableDaysChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      availableDays: checked
        ? [...prevData.availableDays, value]
        : prevData.availableDays.filter((day) => day !== value),
    }));
  };

  const handleDepartmentChange = (e) => {
    const selectedDepartment = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      department: selectedDepartment,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(formData);
    try {
      const {
        name,
        email,
        phone,
        specialization,
        qualifications,
        experienceYears,
        department,
        availableDays,
        availableTime,
        fees,
        adhaarNumber,
        panNumber,
        dateOfBirth,
        accNumber,
        ifscCode,
        accHolderName,
        salary,
      } = formData;

      const requestBody = {
        name,
        email,
        phone,
        specialization,
        qualifications: qualifications.split(",").map((qual) => qual.trim()),
        experienceYears,
        department,
        fees,
        availableDays,
        availableTime,
        adhaarNumber,
        panNumber,
        dateOfBirth,
        accNumber,
        ifscCode,
        accHolderName,
        salary,
      };

      const userDetails = getUserDetails();
      const updatedForm = { ...requestBody, ...userDetails };

      const res = await fetch(`${environment.url}/api/admin/add-doctor`, {
        method: "POST",
        headers: {
          "x-tenant-id": environment.tenantId,
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(updatedForm),
      });

      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        onAddDoctor();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="doctor-form-container">
        <h2 className="doctor-form-heading">Add New Doctor</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group" style={{ marginBottom: "-20px" }}>
            <div className="form-group">
              <label>Name </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Email </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Phone </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Specialization </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row fg-group" style={{ marginBottom: "-20px" }}>
            <div className="form-group">
              <label>Qualifications (comma-separated) </label>
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Experience (Years) </label>
              <input
                type="number"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Department </label>
              <select
                value={formData.department}
                onChange={handleDepartmentChange}
                style={{ padding: "8px" }}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Fees </label>
              <input
                type="number"
                name="fees"
                value={formData.fees}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="register-form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
            <div className="register-form-group">
              <label>Aadhar</label>
              <input
                type="text"
                name="adhaarNumber"
                value={formData.adhaarNumber}
                onChange={handleChange}
              />
            </div>
            <div className="register-form-group">
              <label>PAN</label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="register-form-group">
              <label>Account Number</label>
              <input
                type="text"
                name="accNumber"
                value={formData.accNumber}
                onChange={handleChange}
              />
            </div>
            <div className="register-form-group">
              <label>IFSC Code</label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
              />
            </div>
            <div className="register-form-group">
              <label>Account Holder Name</label>
              <input
                type="text"
                name="accHolderName"
                value={formData.accHolderName}
                onChange={handleChange}
              />
            </div>
            <div className="register-form-group">
              <label>Salary</label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>
          </div>
          <div
            className="input-pair"
            style={{ marginBottom: "-30px", marginTop: "20px" }}
          >
            <div className="doctor-form-group">
              <label>Available Days</label>
              <div className="available-days-container">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <label key={day} className="day-checkbox">
                      <input
                        type="checkbox"
                        value={day}
                        checked={formData.availableDays.includes(day)}
                        onChange={handleAvailableDaysChange}
                      />
                      {day}
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="doctor-form-group">
              <label>Available Time </label>
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
                        availableTime: {
                          ...prevData.availableTime,
                          from: e.target.value,
                        },
                      }))
                    }
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
                        availableTime: {
                          ...prevData.availableTime,
                          to: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="doctor-submit-btn">
            Add Doctor
          </button>
        </form>
      </div>
    </>
  );
};

export default AddDoctor;
