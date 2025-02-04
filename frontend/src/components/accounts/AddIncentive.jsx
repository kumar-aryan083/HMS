import React, { useState } from "react";

const AddIncentive = ({ isOpen, onClose, onAddIncentive, doctors }) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    type: "Doctor",
    doctorName: "",
    doctorId: "",
    head: "",
    date: "",
    time: "",
    amount: "",
    mode: "",
    details: "",
    user: "",
  });
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  const handleDoctorInput = (e) => {
    const { value } = e.target;
    setForm((prevData) => ({
      ...prevData,
      doctorName: value,
    }));
    if (value.length > 2) {
      const filtered = doctors.filter((doctor) =>
        doctor.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setForm((prevData) => ({
      ...prevData,
      doctorId: doctor._id,
      doctorName: doctor.name,
    }));
    setFilteredDoctors([]);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddIncentive(form);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" onClick={onClose} className="closeBtn">
          X
        </button>
        <h3>Add New Incentive</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Type:</label>
              <select
                type="text"
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="Doctor">Doctor</option>
                <option value="Referral">Referral</option>
              </select>
            </div>
            <div className="form-group">
              <label>Doctor Name:</label>
              <input
                className="form-input"
                type="text"
                name="doctorName"
                value={form.doctorName}
                onChange={handleDoctorInput}
                placeholder="Search Doctor by Name"
                autoComplete="off"
              />
              {filteredDoctors.length > 0 && (
                <ul className="autocomplete-dropdown">
                  {filteredDoctors.map((doctor) => (
                    <li
                      key={doctor._id}
                      onClick={() => handleDoctorSelect(doctor)}
                      className="dropdown-item"
                    >
                      {doctor.name} ({doctor.phone})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
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
          <button type="submit">Add Incentive</button>
        </form>
      </div>
    </div>
  );
};

export default AddIncentive;
