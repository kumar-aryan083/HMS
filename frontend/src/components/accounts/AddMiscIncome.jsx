import React, { useState } from "react";

const AddMiscIncome = ({ isOpen, onClose, onAddIncome }) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    head: "",
    date: "",
    time: "",
    amount: "",
    mode: "",
    details: "",
    user: "",
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
    onAddIncome(form);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" onClick={onClose} className="closeBtn">
          X
        </button>
        <h3>Add New Misc. Income</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Head:</label>
              <input
                type="text"
                name="head"
                onChange={handleChange}
                value={form.head}
              />
            </div>

            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                name="date"
                onChange={handleChange}
                value={form.date}
              />
            </div>
            <div className="form-group">
              <label>Time:</label>
              <input
                type="time"
                name="time"
                onChange={handleChange}
                value={form.time}
              />
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Amount:</label>
              <input
                type="text"
                name="amount"
                onChange={handleChange}
                value={form.amount}
              />
            </div>
            <div className="form-group">
              <label>Payment Mode:</label>
              <select name="mode" value={form.mode} onChange={handleChange}>
                <option value="">Select Payment Mode</option>
                <option value="card">Card</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Details</label>
            <textarea
              name="details"
              value={form.details}
              onChange={handleChange}
              style={{ outline: "none" }}
            />
          </div>
          <button type="submit">Add Misc. Income</button>
        </form>
      </div>
    </div>
  );
};

export default AddMiscIncome;
