import React, { useContext, useEffect, useState } from "react";
import "./styles/Register.css";
import { Link, useNavigate } from "react-router-dom";
import { environment } from "../../utlis/environment.js";
import { AppContext } from "../context/AppContext.jsx";

const Register = ({ onClose, onAddStaff, onEditStaff, editData = null }) => {
  const { user, setNotification } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    cnfPassword: "",
    role: "",
    department: "",
    phone: "",
    adhaarNumber: "",
    panNumber: "",
    dateOfBirth: "",
    accNumber: "",
    ifscCode: "",
    accHolderName: "",
    salary: "",
  });
  const [departments, setDepartments] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    // console.log("edit data", editData);
    // Pre-fill form if editData is provided
    if (editData) {
      setFormData({
        name: editData.name || "",
        email: editData.email || "",
        phone: editData.phone || "",
        role: editData.role || "",
        adhaarNumber: editData.adhaarNumber || "",
        panNumber: editData.panNumber || "",
        dateOfBirth: editData.dateOfBirth
          ? new Date(editData.dateOfBirth).toISOString().split("T")[0]
          : "",
        accNumber: editData.accNumber || "",
        accHolderName: editData.accHolderName || "",
        ifscCode: editData.ifscCode || "",
        salary: editData.salary || "",
      });
    }
  }, [editData]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleDepartmentChange = (e) => {
    const selectedDepartmentId = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      department: selectedDepartmentId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password != formData.cnfPassword) {
      setNotification("Password do not match");
      return;
    }
    // console.log({
    //   ...formData,
    //   url: `${environment.url}/api/admin/add-${formData.role}`,
    // });
    if (editData) {
      // console.log("update form data", formData);
      try {
        const res = await fetch(
          `${environment.url}/api/common/edit-staff/${editData.role}/${editData._id}`,
          {
            method: "PUT",
            headers: {
              "x-tenant-id": environment.tenantId,
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
            body: JSON.stringify(formData),
          }
        );
        const data = await res.json();
        if (res.ok) {
          setNotification(data.message);
          onEditStaff();
          onClose();
        } else {
          setNotification(data.message);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      // console.log("form data:", formData)
      try {
        const res = await fetch(
          `${environment.url}/api/admin/add-${formData.role}`,
          {
            method: "POST",
            headers: {
              "x-tenant-id": environment.tenantId,
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
            body: JSON.stringify(formData),
          }
        );
        const data = await res.json();
        if (res.ok) {
          setNotification(data.message);
          onAddStaff();
          // onClose();
        } else {
          setNotification(data.message);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <>
      <section className="register-form-container">
        <h2 className="doctor-form-heading">
          {editData ? "Edit Staff" : "Register Staff"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="register-form-row fg-group">
            <div className="register-form-group">
              <label>Role</label>
              <select
                name="role"
                id="register-role"
                value={formData.role}
                onChange={handleChange}
                disabled={!!editData}
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="counter">Counter</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="laboratory">Laboratory</option>
                <option value="nurse">Nurse</option>
                <option value="store">Store</option>
                <option value="hr">HR</option>
                <option value="other-role">Other Role</option>
                {/*<option value="inventory">Inventory</option> */}
              </select>
            </div>
            <div className="register-form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="register-form-row fg-group">
            <div className="register-form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="register-form-group">
              <label>Phone</label>
              <input
                type="number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="register-form-row fg-group">
            {formData.role === "nurse" && (
              <div className="register-form-group">
                <label>Department</label>
                <select
                  value={formData.department}
                  onChange={handleDepartmentChange}
                >
                  <option value="">Select Department</option>
                  {departments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="register-form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="register-form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="cnfPassword"
                value={formData.cnfPassword}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row fg-group" style={{ marginTop: "10px" }}>
            <div className="register-form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
            <div className="register-form-group">
              <label>Aadhar</label>
              <input
                type="text"
                name="adhaarNumber"
                value={formData.adhaarNumber}
                onChange={handleChange}
              />
            </div>
            <div className="register-form-group">
              <label>PAN</label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="register-form-group">
              <label>Account Number</label>
              <input
                type="text"
                name="accNumber"
                value={formData.accNumber}
                onChange={handleChange}
              />
            </div>
            <div className="register-form-group">
              <label>IFSC Code</label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="register-form-group">
              <label>Account Holder Name</label>
              <input
                type="text"
                name="accHolderName"
                value={formData.accHolderName}
                onChange={handleChange}
              />
            </div>
            <div className="register-form-group">
              <label>Salary</label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>
          </div>
          <button type="submit" className="register-submit-btn">
            {editData ? "Save Changes" : "Register Staff"}
          </button>
        </form>
        {/* <div className="ex-register">
          <p>
            Already have an accout?{" "}
            <span>
              <Link to="/login">Login here</Link>
            </span>
          </p>
        </div> */}
      </section>
    </>
  );
};

export default Register;
