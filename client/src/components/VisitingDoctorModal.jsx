import React, { useEffect, useState } from "react";
import "./styles/WingModal.css";

const VisitingDoctorModal = ({ isOpen, onClose, onAddDoctor }) => {
  if (!isOpen) return null;
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    visitFees: "",
  });

  
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddDoctor(form); // Callback to add the visiting doctor
    onClose(); // Close the modal after submission
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" onClick={onClose} className="closeBtn">
          X
        </button>
        <h3>Add New Visiting Doctor</h3>
        <form onSubmit={handleSubmit}>
          <div className="input-pair vd-inpt">
            <label>
              Name:
              <input
                type="text"
                name="name"
                onChange={handleChange}
                value={form.name}
                required
              />
            </label>
            <label>
              Phone:
              <input
                type="text"
                name="phone"
                onChange={handleChange}
                value={form.phone}
                required
              />
            </label>
          </div>
          <label>
            Email:
            <input
                type="text"
                name="email"
                onChange={handleChange}
                value={form.email}
                className="vd-email"
                required
              />
          </label>
          
          <div className="input-pair">
            <label>
              Speciality:
              <select
              name="specialization"
              onChange={handleChange}
              value={form.specialization}
              className="vd-dropdown"
              required
            >
              <option value="">Select Specialization</option>
              <option value="ENT">ENT</option>
              <option value="Physician">Physician</option>
              <option value="Gynecology">Gynecology</option>
              <option value="General Surgery">General Surgery</option>
              <option value="Neurology">Neurology</option>
              <option value="Psychiatry">Psychiatry</option>
            </select>
            </label>
            <label>
              Visit Fees:
              <input
                type="text"
                name="visitFees"
                onChange={handleChange}
                value={form.visitFees}
                required
              />
            </label>
          </div>

          <button type="submit">Add Visiting Doctor</button>
        </form>
      </div>
    </div>
  );
};

export default VisitingDoctorModal;
