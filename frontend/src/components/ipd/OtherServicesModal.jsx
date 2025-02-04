import React, { useEffect, useState } from "react";
import "./styles/WingModal.css";

const OtherServicesModal = ({ isOpen, onClose, onAddOtherServices }) => {
  if (!isOpen) return null;
  const [form, setForm] = useState({
    name: "",
    pricePerUnit: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddOtherServices(form);
    onClose(); // Close the modal after submission
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{width: "400px",height: "57%", paddingTop: "10px"}}>
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3>Add Other Service</h3>
        <form onSubmit={handleSubmit}>
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
            <div className="form-group">
              <label>
                Price Per Unit:
                <input
                  type="Number"
                  name="pricePerUnit"
                  onChange={handleChange}
                  value={form.pricePerUnit}
                />
              </label>
            </div>

          <button type="submit">Add Other Service</button>
        </form>
      </div>
    </div>
  );
};

export default OtherServicesModal;
