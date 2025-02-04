import React, { useState } from "react";

const AddStoreCategory = ({ isOpen, onClose, onAddStoreCategory }) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    name: "",
    status: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddStoreCategory(form);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{height:"60%", width: "30%"}}>
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3>Add New Store Category</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              onChange={handleChange}
              value={form.name}
              required
            />
          </div>
          <div className="form-group">
            <label>Status:</label>
            <select
              name="status"
              id="cast-status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button type="submit">Add Store Category</button>
        </form>
      </div>
    </div>
  );
};

export default AddStoreCategory;
