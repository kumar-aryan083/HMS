import React, { useState } from 'react';
import './styles/WingModal.css';

const WingModal = ({ isOpen, onClose, onAddWing }) => {
  if (!isOpen) return null;
  const [form, setForm] = useState({
    name: "",
    description: ""
  })

  const handleChange = (e)=>{
    setForm({
        ...form,
        [e.target.name]: e.target.value
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddWing(form); // Callback to add the wing
    onClose(); // Close the modal after submission
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{height: "82%"}}>
      <button type="button" onClick={onClose} className='opd-closeBtn'>X</button> 
        <h3>Add New Wing</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Wing Name:
            <input type="text" name="name" onChange={handleChange} value={form.name}  />
          </label>
          <label>
            Description:
            <textarea type="text" name="description" rows={10} onChange={handleChange} value={form.description}  />
          </label>
          <button type="submit">Add Wing</button>
        </form>
      </div>
    </div>
  );
};

export default WingModal;
