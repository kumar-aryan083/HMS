import React, { useContext, useEffect, useState } from "react";
import "./styles/AddDispensary.css";
import { AppContext } from "../../context/AppContext";
import { environment } from "../../../utlis/environment";

const AddDispensary = () => {
  const { setNotification } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    isActive: false,
    printInvoice: false,
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
    // console.log("Dispensary Added:", formData);
    try {
      const res = await fetch(
        `${environment.url}/api/pharmacy/add-dispensary`,
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
          name: "",
          type: "",
          description: "",
          isActive: false,
          printInvoice: false,
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
    <div className="add-dispensary-container">
      <h2>Add Dispensary</h2>
      <form className="dispensary-form" onSubmit={handleSubmit}>
        <div className="form-row fg-group">
          <div className="form-group">
            <label>
              Dispensary Name:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Dispensary Name"
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Dispensary Type:
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select Type
                </option>
                <option value="Insurance">Insurance</option>
                <option value="Normal">Normal</option>
              </select>
            </label>
          </div>
        </div>
        <div className="fg-group">
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
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="printInvoice"
              checked={formData.printInvoice}
              onChange={handleChange}
            />
            Print InvoiceHeader in DotMatrix:
          </label>
        </div>

        <button type="submit" className="submit-btn">
          Add Dispensary
        </button>
      </form>
    </div>
  );
};

export default AddDispensary;
