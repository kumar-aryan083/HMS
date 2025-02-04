import React, { useContext, useEffect, useState } from "react";
import "./styles/AddDepartment.css";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import { environment } from "../../utlis/environment.js";
import { getUserDetails } from "../../utlis/userDetails.js";

const AddDepartment = ({ onClose, onAddDepartment }) => {
  const { setNotification, user } = useContext(AppContext);
  const nav = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    headOfDepartment: "",
    servicesOffered: "",
  });

  useEffect(() => {
    document.title = "Add Department | HMS";
    if (!user || user.role !== "admin") {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

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
      const services = servicesOffered
        .split(",")
        .map((service) => service.trim());

      const requestBody = {
        name,
        location,
        headOfDepartment,
        servicesOffered: services,
      };

      const userDetails = getUserDetails();
      const updatedForm = { ...requestBody, ...userDetails };

      const res = await fetch(`${environment.url}/api/admin/add-department`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(updatedForm),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        onAddDepartment();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="department-form-container">
        <h2 className="department-form-headline">Add Department</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group" style={{ marginBottom: "-20px" }}>
            <div className="form-group">
              <label htmlFor="name" className="pr-label">
                Department Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="location" className="pr-label">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row fg-group" style={{ marginBottom: "-20px" }}>
            <div className="form-group">
              <label htmlFor="headOfDepartment">Head of Department</label>
              <input
                type="text"
                id="headOfDepartment"
                name="headOfDepartment"
                value={formData.headOfDepartment}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="servicesOffered">
                Services Offered (comma separated)
              </label>
              <input
                type="text"
                id="servicesOffered"
                name="servicesOffered"
                value={formData.servicesOffered}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="submit-department-btn">
            Add Department
          </button>
        </form>
      </div>
    </>
  );
};

export default AddDepartment;
