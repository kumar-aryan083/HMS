import React, { useState } from "react";
// import "./styles/WingModal.css";

const LabVendorModel = ({ isOpen, onClose, onAddLabCategory }) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
    contactNumber: "",
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddLabCategory(form);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{height:"70%"}}>
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3>Add New Lab Vendor</h3>
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
                  required
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Code:
                <input
                  type="text"
                  name="code"
                  onChange={handleChange}
                  value={form.code}
                  required
                />
              </label>
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>
                Contact Number:
                <input
                  type="text"
                  name="contactNumber"
                  onChange={handleChange}
                  value={form.contactNumber}
                  required
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Email:
                <input
                  type="text"
                  name="email"
                  onChange={handleChange}
                  value={form.email}
                  required
                />
              </label>
            </div>
          </div>
          <div className="form-group fg-group">
            <label>
              Address:
              <input
                type="text"
                name="address"
                onChange={handleChange}
                value={form.address}
                required
              />
            </label>
          </div>

          <button type="submit">Add Lab Vendor</button>
        </form>
      </div>
    </div>
  );
};

export default LabVendorModel;
