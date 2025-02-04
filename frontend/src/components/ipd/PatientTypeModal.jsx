import React, { useEffect, useState } from "react";
import "./styles/WingModal.css";

const PatientTypeModal = ({ isOpen, onClose, onAddType }) => {
  if (!isOpen) return null;
  const [form, setForm] = useState({
    name: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddType(form);
    onClose(); // Close the modal after submission
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{width: "400px",height: "40%"}}>
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3>Add New Patient Type</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  onChange={handleChange}
                  value={form.name}
                  
                />
              </label>
            </div>
          </div>

          <button type="submit">Add Patient Type</button>
        </form>
      </div>
    </div>
  );
};

export default PatientTypeModal;
