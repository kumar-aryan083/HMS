import React, { useEffect, useState } from "react";
import { environment } from "../../../utlis/environment";

const AddStoreReciever = ({ isOpen, onClose, onAddStoreReciever }) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    code: "",
    department: "",
  });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/admin/get-departments`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await response.json();
      setDepartments(data.departments);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const handleDepartmentChange = (e) => {
    const selectedDepartment = e.target.value;
    setForm((prevData) => ({
      ...prevData,
      department: selectedDepartment,
    }));
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddStoreReciever(form);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{height:"55%", width: "50%"}}>
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3>Add New Store Reciever</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                onChange={handleChange}
                value={form.name}
              />
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input
                type="text"
                name="phone"
                onChange={handleChange}
                value={form.phone}
              />
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Code:</label>
              <input
                type="text"
                name="code"
                onChange={handleChange}
                value={form.code}
              />
            </div>
            <div className="form-group">
              <label>Department </label>
              <select
                value={form.department}
                onChange={handleDepartmentChange}
                style={{ padding: "8px" }}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit">Add Store Reciever</button>
        </form>
      </div>
    </div>
  );
};

export default AddStoreReciever;
