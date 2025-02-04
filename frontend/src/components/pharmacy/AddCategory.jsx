import React, { useContext, useEffect, useState } from "react";
import "./styles/AddCategory.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";

const AddCategory = ({
  toggleConsumablesPopup,
  medicine = null,
  onClose = null,
  onUpdate = null,
  isEdit,
}) => {
  const { setNotification } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
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
    // console.log("Category Added:", formData);
    try {
      if (onUpdate) {
        onUpdate(formData);
        onClose();
      } else {
        const res = await fetch(
          `${environment.url}/api/pharmacy/add-category`,
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
    <div className="add-category-container" style={{width: "500px"}}>
      <h2>{isEdit ? "Update Category" : "Add New Category"}</h2>
      <form className="category-form" onSubmit={handleSubmit}>
        <div className="fg-group">
          <label>
            Category Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Category Name"
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

        <div className="cb-inpts" style={{marginTop: "10px"}}>
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
          {!isEdit ? "Add Category" : "Update Category"}
        </button>
      </form>
    </div>
  );
};

export default AddCategory;
