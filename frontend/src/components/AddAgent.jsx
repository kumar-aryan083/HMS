import React, { useContext, useState } from "react";

const AddAgent = ({ onClose, onAddAgent }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    adhaarNumber: "",
    panNumber: "",
    dateOfBirth: "",
    accNumber: "",
    ifscCode: "",
    accHolderName: "",
    salary: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddAgent(form);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ height: "72%", maxWidth: "60%" }}>
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3>Add Agent</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group">
            {/* Name Field */}
            <div className="form-group">
              <label>Name:</label>
              <input
                className="form-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Agent Name"
                required
              />
            </div>
            {/* Email Field */}
            <div className="form-group">
              <label>Email:</label>
              <input
                className="form-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
              />
            </div>
            {/* Phone Field */}
            <div className="form-group">
              <label>Phone:</label>
              <input
                className="form-input"
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
              />
            </div>
          </div>
          <div className="form-row fg-group">
            {/* Aadhaar Number Field */}
            <div className="form-group">
              <label>Aadhaar Number:</label>
              <input
                className="form-input"
                type="text"
                name="adhaarNumber"
                value={form.adhaarNumber}
                onChange={handleChange}
                placeholder="Aadhaar Number"
              />
            </div>
            {/* PAN Number Field */}
            <div className="form-group">
              <label>PAN Number:</label>
              <input
                className="form-input"
                type="text"
                name="panNumber"
                value={form.panNumber}
                onChange={handleChange}
                placeholder="PAN Number"
              />
            </div>
            {/* Date of Birth Field */}
            <div className="form-group">
              <label>Date of Birth:</label>
              <input
                className="form-input"
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row fg-group">
            {/* Account Number Field */}
            <div className="form-group">
              <label>Account Number:</label>
              <input
                className="form-input"
                type="text"
                name="accNumber"
                value={form.accNumber}
                onChange={handleChange}
                placeholder="Account Number"
              />
            </div>
            {/* IFSC Code Field */}
            <div className="form-group">
              <label>IFSC Code:</label>
              <input
                className="form-input"
                type="text"
                name="ifscCode"
                value={form.ifscCode}
                onChange={handleChange}
                placeholder="IFSC Code"
              />
            </div>
            {/* Account Holder Name Field */}
            <div className="form-group">
              <label>Account Holder Name:</label>
              <input
                className="form-input"
                type="text"
                name="accHolderName"
                value={form.accHolderName}
                onChange={handleChange}
                placeholder="Account Holder Name"
              />
            </div>
            {/* Salary Field */}
            <div className="form-group">
              <label>Salary:</label>
              <input
                className="form-input"
                type="number"
                name="salary"
                value={form.salary}
                onChange={handleChange}
                placeholder="Salary"
              />
            </div>
          </div>
          <button type="submit">Add Agent</button>
        </form>
      </div>
    </div>
  );
};

export default AddAgent;
