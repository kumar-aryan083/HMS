import React, { useState } from "react";

const AddExpense = ({ isOpen, onClose, onAddExpense }) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    head: "",
    amount: "",
    paymentMode: "",
    date: "",
    time: "",
    details: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddExpense(form);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3>Add New Expense</h3>
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
              <label>Amount:</label>
              <input
                type="text"
                name="amount"
                onChange={handleChange}
                value={form.amount}
              />
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Payment Mode:</label>
              <select
                name="paymentMode"
                value={form.paymentMode}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
              </select>
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
          <div className="form-group">
            <label>Details</label>
            <textarea name="details" value={form.details} onChange={handleChange} style={{outline: "none"}} />
          </div>
          <button type="submit">Add Expense</button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
