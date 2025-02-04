import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";

const AddAdditonalService = ({
  onClose,
  onAddService,
}) => {
  const [form, setForm] = useState({
    name: "",
    generalFees: ""
  });

  const handleChange = (e)=>{
    setForm({
        ...form,
        [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddService(form);
    onClose();
  };


  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{height: "40%"}}>
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3>Add Service</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Name:</label>
              <input
                className="form-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Service Name"
                
              />
            </div>
            <div className="form-group">
              <label>General Fees:</label>
              <input
                className="form-input"
                type="text"
                name="generalFees"
                value={form.generalFees}
                onChange={handleChange}
                placeholder="General Fees"
                
              />
            </div>
            
          </div>

          <button type="submit">Add Service</button>
        </form>
      </div>
    </div>
  );
};

export default AddAdditonalService;
