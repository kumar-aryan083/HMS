import React, { useState } from "react";
// import "./styles/WingModal.css";

const LabLookUpModel = ({ isOpen, onClose, onAddLabCategory }) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    lookupName: "",
    description: "",
    lookUpData: [""],
  });

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    if (index !== null) {
      setForm((prevForm) => ({
        ...prevForm,
        lookUpData: prevForm.lookUpData.map((dataField, i) =>
          i === index ? value : dataField
        ),
      }));
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        [name]: value,
      }));
    }
  };

  const handleAddDataField = () => {
    setForm((prevForm) => ({
      ...prevForm,
      lookUpData: [...prevForm.lookUpData, ""],
    }));
  };

  const handleRemoveDataField = (index) => {
    setForm((prevForm) => ({
      ...prevForm,
      lookUpData: prevForm.lookUpData.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddLabCategory(form);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ height: "60%" }}>
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3>Add New Lab LookUps</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>
                Name:
                <input
                  type="text"
                  name="lookupName"
                  onChange={handleChange}
                  value={form.lookupName}
                  required
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Descrition:
                <input
                  type="text"
                  name="description"
                  onChange={handleChange}
                  value={form.description}
                  required
                />
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>
              Data:
              {form.lookUpData.map((dataField, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <input
                    type="text"
                    value={dataField}
                    onChange={(e) => handleChange(e, index)}
                    required
                    style={{ width: "90%" }}
                  />
                  <button
                    type="button"
                    onClick={handleAddDataField}
                    style={{
                      marginLeft: "8px",
                      cursor: "pointer",
                      padding: "0 8px",
                      width: "10%",
                      height: "30px",
                    }}
                  >
                    +
                  </button>
                  {form.lookUpData.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDataField(index)}
                      style={{
                        marginLeft: "4px",
                        cursor: "pointer",
                        padding: "0 8px",
                        width: "10%",
                        height: "30px",
                      }}
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
            </label>
          </div>

          <button type="submit">Add Lab LookUp</button>
        </form>
      </div>
    </div>
  );
};

export default LabLookUpModel;
