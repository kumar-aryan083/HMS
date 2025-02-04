import React, { useContext, useEffect, useState } from "react";
import "./styles/AddCompany.css";
import { AppContext } from "../../context/AppContext";
import { environment } from "../../../utlis/environment";

const AddCompany = ({
  toggleConsumablesPopup,
  medicine = null,
  onClose = null,
  onUpdate = null,
  isEdit,
}) => {
  const { setNotification } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    contactNumber: "",
    description: "",
    contactAddress: "",
    email: "",
    isActive: false,
  });

  useEffect(() => {
    if (medicine) {
      setFormData(medicine);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Company Added:", formData);
    try {
      if (onUpdate) {
        onUpdate(formData);
        onClose();
      } else {
        const res = await fetch(`${environment.url}/api/pharmacy/add-company`, {
          method: "POST",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.ok) {
          setNotification(data.message);
          setFormData({
            name: "",
            contactNumber: "",
            description: "",
            contactAddress: "",
            email: "",
            isActive: false,
          });
          toggleConsumablesPopup();
        } else {
          setNotification("something went wrong");
        }
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  return (
    <div className="add-company-container">
      <h2>{isEdit ? "Update Company" :"Add New Company"}</h2>
      <form className="company-form" onSubmit={handleSubmit}>
        <div className="form-row fg-group">
          <div className="form-group">
            <label>
              Company Name:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Company Name"
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Contact Number:
              <input
                type="number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Contact Number"
                required
              />
            </label>
          </div>
        </div>

        <div className="form-row fg-group">
          <div className="form-group">
            <label>
              Contact Address:
              <input
                type="text"
                name="contactAddress"
                value={formData.contactAddress}
                onChange={handleChange}
                placeholder="Contact Address"
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
            </label>
          </div>
        </div>
        <div className="fg-group" >
          <label>
            Description:
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              required
            />
          </label>
        </div>

        <div className="cb-inpts">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            Is Active
          </label>
        </div>

        <button type="submit" className="submit-btn" style={{backgroundColor: "var(--secondBase)", margin: "0"}}>
        {isEdit ? "Update Company" : "Add Company"}
        </button>
      </form>
    </div>
  );
};

export default AddCompany;
