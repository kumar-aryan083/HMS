import React, { useContext, useEffect, useState } from "react";
import "./styles/AddTax.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";

const AddTax = ({
  toggleConsumablesPopup,
  medicine = null,
  onClose = null,
  onUpdate = null,
}) => {
  const { setNotification } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    percentage: "",
  });

  useEffect(() => {
    if (medicine) {
      setFormData(medicine);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Tax Added:", formData);
    try {
      if (onUpdate) {
        onUpdate(formData);
        onClose();
      } else {
        const res = await fetch(`${environment.url}/api/pharmacy/add-tax`, {
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
            description: "",
            percentage: "",
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
    <div className="add-tax-container">
      <h2>Add Tax: </h2>
      <form className="tax-form" onSubmit={handleSubmit}>
        <div className="fg-group">
          <label>
            Tax Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tax Name"
              required
            />
          </label>
        </div>
        <div className="fg-group">
          <label>
            Tax Percentage:
            <input
              type="number"
              name="percentage"
              value={formData.percentage}
              onChange={handleChange}
              placeholder="Tax Percentage"
              required
            />
          </label>
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

        <button type="submit" className="submit-btn">
          Add Tax
        </button>
      </form>
    </div>
  );
};

export default AddTax;
