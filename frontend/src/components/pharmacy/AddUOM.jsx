import React, { useContext, useEffect, useState } from "react";
import "./styles/AddUOM.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";

const AddUOM = ({
  toggleConsumablesPopup,
  medicine = null,
  onClose = null,
  onUpdate = null,
  isEdit
}) => {
  const { setNotification } = useContext(AppContext);
  const [formData, setFormData] = useState({
    uom: "",
    description: "",
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
    // console.log("UOM Added:", formData);
    try {
      if (onUpdate) {
        onUpdate(formData);
        onClose();
      } else {
        const res = await fetch(`${environment.url}/api/pharmacy/add-uom`, {
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
            uom: "",
            description: "",
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
    <div className="add-uom-container">
      <h2>
        {isEdit ? "Edit Unit of Measurement" : "Add Unit of Measurement"}{" "}
      </h2>
      <form className="uom-form" onSubmit={handleSubmit}>
        <div className="fg-group">
          <label>
            Unit of Measurement:
            <input
              type="text"
              name="uom"
              value={formData.uom}
              onChange={handleChange}
              placeholder="Unit of Measurement"
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

        <button type="submit" className="submit-btn" style={{backgroundColor: "var(--secondBase)"}}>
          {isEdit ? "Edit Unit of Measurement" : "Add Unit of Measurement"}
        </button>
      </form>
    </div>
  );
};

export default AddUOM;
