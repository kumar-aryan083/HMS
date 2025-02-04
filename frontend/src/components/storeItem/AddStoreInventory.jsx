import React, { useState } from "react";

const AddStoreInventory = ({ isOpen, onClose, onAddStoreInventory, departments }) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    rate: "",
    gstn: "",
    vendor: "",
    purchasedBy: "",
    department: "",
    departmentName: "",
    date: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleDepartmentChange = (e) => {
    const selectedDepartmentId = e.target.value;
    const selectedDepartment = departments.find(
      (dept) => dept._id === selectedDepartmentId
    );
    setForm((prevData) => ({
      ...prevData,
      department: selectedDepartmentId,
      departmentName: selectedDepartment.name,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddStoreInventory(form);
    onClose();
  };
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" onClick={onClose} className="closeBtn">
          X
        </button>
        <h3>Add New Store Inventory</h3>
        <form onSubmit={handleSubmit}>
        <div className="form-row fg-group">
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
              <label>Quantity:</label>
              <input
                type="number"
                name="quantity"
                onChange={handleChange}
                value={form.quantity}
                required
              />
            </div>
            <div className="form-group">
              <label>Rate:</label>
              <input
                type="number"
                name="rate"
                onChange={handleChange}
                value={form.rate}
                required
              />
            </div>
            <div className="form-group">
              <label>GSTN:</label>
              <input
                type="text"
                name="gstn"
                onChange={handleChange}
                value={form.gstn}
                required
              />
            </div>
            <div className="form-group">
              <label>Vendor:</label>
              <input
                type="text"
                name="vendor"
                onChange={handleChange}
                value={form.vendor}
                required
              />
            </div>
            <div className="form-group">
              <label>Purchased By:</label>
              <input
                type="text"
                name="purchasedBy"
                onChange={handleChange}
                value={form.purchasedBy}
                required
              />
            </div>
            <div className="form-group">
                <label>Department</label>
                <select
                  value={form.department}
                  onChange={handleDepartmentChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
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
          </div>
          <button type="submit">Add Store Inventory</button>
        </form>
      </div>
    </div>
  );
};

export default AddStoreInventory;
