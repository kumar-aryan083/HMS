import React, { useState } from "react";
// import "./styles/WingModal.css";

const LabCategoryModal = ({ isOpen, onClose, onAddLabCategory }) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    name: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm)=>({
        ...prevForm,
        [name]: value
    }))
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddLabCategory(form);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{height: "40%", width:"30%"}}>
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3>Add New Lab Category</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group fg-group">
            <label>
              Name:
              <input
                type="text"
                name="name"
                onChange={handleChange}
                value={form.name}
                required
              />
            </label>
          </div>

          <button type="submit">Add Lab Category</button>
        </form>
      </div>
    </div>
  );
};

export default LabCategoryModal;
