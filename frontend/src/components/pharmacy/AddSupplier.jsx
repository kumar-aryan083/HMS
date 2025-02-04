import React, { useContext, useEffect, useState } from "react";
import "./styles/AddSupplier.css";
import { AppContext } from "../../context/AppContext";
import { environment } from "../../../utlis/environment";

const AddSupplier = ({
  toggleConsumablesPopup,
  medicine = null,
  onClose = null,
  onUpdate = null,
  editPopup,
}) => {
  const { setNotification } = useContext(AppContext);
  const [formData, setFormData] = useState({
    description: "",
    city: "",
    creditPeriod: "0",
    kraPin: "",
    dda: "",
    contactAddress: "",
    additionalContact: "",
    email: "",
    isActive: false,
    isLedgerRequired: false,
    gstNumber: "",
    panNumber: "",
    name: "",
    companyName: "",
    contactNo: "",
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
    // console.log("Supplier Added:", formData);
    try {
      if (onUpdate) {
        onUpdate(formData);
        onClose();
      } else {
        const res = await fetch(
          `${environment.url}/api/pharmacy/add-supplier`,
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
            description: "",
            city: "",
            creditPeriod: "0",
            kraPin: "",
            dda: "",
            contactAddress: "",
            additionalContact: "",
            email: "",
            isActive: false,
            isLedgerRequired: false,
            gstNumber: "",
            panNumber: "",
            name: "",
            companyName: "",
            contactNo: "",
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
    <div className="add-supplier-container">
      <h2>{editPopup ? "Edit Supplier" : "Add Supplier"}</h2>
      <form className="supplier-form" onSubmit={handleSubmit}>
        <div className="form-row fg-group">
          <div className="form-group">
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Comany Name:
              <input
                type="search"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Company Name"
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
              Contact No:
              <input
                type="number"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                placeholder="Contact No"
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              GST Number:
              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                placeholder="GST Number"
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Pan Number:
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                placeholder="Pan Number"
                required
              />
            </label>
          </div>
        </div>
        <div className="form-row fg-group">
          <div className="form-group">
            <label>
              City:
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              KRA PIN:
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
        </div>

        <div className="form-row fg-group">
          <div className="form-group">
            <label>
              Credit Period:
              <input
                type="number"
                name="creditPeriod"
                value={formData.creditPeriod}
                onChange={handleChange}
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
        </div>

        <div className="form-row fg-group">
          <div className="form-group">
            <label>
              Additional Contact:
              <input
                type="text"
                name="additionalContact"
                value={formData.additionalContact}
                onChange={handleChange}
                placeholder="Additional Address"
              />
            </label>
          </div>
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
              name="isLedgerRequired"
              checked={formData.isLedgerRequired}
              onChange={handleChange}
            />
            Is Ledger Required
          </label>
        </div>

        <button type="submit" className="supplier-submit-btn">
          {editPopup ? "Update Supplier" : "Add Supplier"}
        </button>
      </form>
    </div>
  );
};

export default AddSupplier;
