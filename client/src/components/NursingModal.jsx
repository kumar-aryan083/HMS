import React, { useEffect, useState } from "react";
import "./styles/WingModal.css";

const NursingModal = ({ isOpen, onClose, onAddNurse }) => {
  if (!isOpen) return null;
  const [form, setForm] = useState({
    name: "",
    phone: "",
    perUnitPrice: "",
    gender: ""
  });

  
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddNurse(form); 
    onClose(); // Close the modal after submission
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" onClick={onClose} className="closeBtn">
          X
        </button>
        <h3>Add New Nursing Item</h3>
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
          <div className="input-pair">
            <label>
              Gender:
              <select
              name="gender"
              onChange={handleChange}
              value={form.gender}
              className="vd-dropdown"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              </select>
            </label>
            <label>
              Per Unit Price:
              <input
                type="text"
                name="perUnitPrice"
                onChange={handleChange}
                value={form.perUnitPrice}
                required
              />
            </label>
          </div>

          <button type="submit">Add Nursing Item</button>
        </form>
      </div>
    </div>
  );
};

export default NursingModal;
