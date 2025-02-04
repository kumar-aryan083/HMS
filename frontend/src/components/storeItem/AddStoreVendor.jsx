import React, { useEffect, useState } from "react";
import { environment } from "../../../utlis/environment";

const AddStoreVendor = ({ isOpen, onClose, onAddStoreVendor }) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    companyName: "",
    gstNo: "",
    contactPerson: "",
    contactNo1: "",
    contactNo2: "",
    address: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddStoreVendor(form);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3>Add New Store Vendor</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Company Name:</label>
              <input
                type="text"
                name="companyName"
                onChange={handleChange}
                value={form.companyName}
              />
            </div>
            <div className="form-group">
              <label>GST No. :</label>
              <input
                type="text"
                name="gstNo"
                onChange={handleChange}
                value={form.gstNo}
              />
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Contact Person:</label>
              <input
                type="text"
                name="contactPerson"
                onChange={handleChange}
                value={form.contactPerson}
              />
            </div>
            <div className="form-group">
              <label>Contact Number 1:</label>
              <input
                type="text"
                name="contactNo1"
                onChange={handleChange}
                value={form.contactNo1}
              />
            </div>
            <div className="form-group">
              <label>Contact Number 2:</label>
              <input
                type="text"
                name="contactNo2"
                onChange={handleChange}
                value={form.contactNo2}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              id="store-vendor-address"
              value={form.address}
              onChange={handleChange}
              rows={5}
              style={{outline: "none"}}
            />
          </div>
          <button type="submit">Add Store Vendor</button>
        </form>
      </div>
    </div>
  );
};

export default AddStoreVendor;
