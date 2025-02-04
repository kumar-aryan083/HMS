import React, { useContext, useState } from "react";
import "./styles/AddInvoiceHeader.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";

const AddInvoiceHeader = () => {
  const { setNotification } = useContext(AppContext);
  const [formData, setFormData] = useState({
    hospitalName: "",
    address: "",
    telephone: "",
    email: "",
    kraPin: "",
    dda: "",
    headerDescription: "",
    isActive: false,
    logoImage: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Invoice Added:", formData);
    try {
      const res = await fetch(
        `${environment.url}/api/pharmacy/add-invoice-header`,
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
        setFormData({
          hospitalName: "",
          address: "",
          telephone: "",
          email: "",
          kraPin: "",
          dda: "",
          headerDescription: "",
          isActive: false,
          logoImage: "",
        });
      } else {
        setNotification("something went wrong");
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  return (
    <div className="add-invoice-container">
      <h2>Add Invoice Header</h2>
      <form className="invoice-form" onSubmit={handleSubmit}>
        <div className="form-row fg-group">
          <div className="form-group">
            <label>
              Hospital Name:
              <input
                type="text"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                placeholder="Hospital Name"
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Address:
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                required
              />
            </label>
          </div>
        </div>
        <div className="form-row fg-group">
          <div className="form-group">
            <label>
              Telephone:
              <input
                type="text"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="Telephone"
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
        <div className="form-row fg-group">
          <div className="form-group">
            <label>
              KRA Pin:
              <input
                type="text"
                name="kraPin"
                value={formData.kraPin}
                onChange={handleChange}
                placeholder="KRA Pin"
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              DDA:
              <input
                type="text"
                name="dda"
                value={formData.dda}
                onChange={handleChange}
                placeholder="DDA"
                required
              />
            </label>
          </div>
        </div>
        <div className="fg-group">
          <label>
            Header Description:
            <input
              type="text"
              name="headerDescription"
              value={formData.headerDescription}
              onChange={handleChange}
              placeholder="Header Description"
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

        <button type="submit" className="submit-btn">
          Add Invoice Header
        </button>
      </form>
    </div>
  );
};

export default AddInvoiceHeader;
