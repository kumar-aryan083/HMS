import React, { useState } from "react";
// import "./styles/WingModal.css";

const LabReportTemplateModel = ({ isOpen, onClose, onAddLabCategory }) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    name: "",
    shortName: "",
    description: "",
    templateType: "",
    columnSettings: [""],
    headerText: "",
    isDefault: false,
    footerText: "",
    displaySequence: 100,
  });

  const options = ["Name", "Result", "Range", "Method", "Unit", "Remarks"];

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddLabCategory(form);
    onClose();
  };

  const handleCheckboxChange = (option) => {
    if (form.columnSettings.includes(option)) {
      // Remove the option if it is already selected
      setForm((prevForm) => ({
        ...prevForm,
        columnSettings: prevForm.columnSettings.filter(
          (item) => item !== option
        ),
      }));
    } else {
      // Add the option if it is not selected
      setForm((prevForm) => ({
        ...prevForm,
        columnSettings: [...prevForm.columnSettings, option],
      }));
    }
  };

  const handleSelectAll = () => {
    // Select all options if not all are selected; otherwise, clear all
    if (form.columnSettings.length === options.length) {
      setForm((prevForm) => ({
        ...prevForm,
        columnSettings: [],
      }));
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        columnSettings: options,
      }));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{height: "85%"}}>
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3>Add New Lab Report Template</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group">
            <div className="form-group">
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

            <div className="form-group">
              <label>
                Short Name:
                <input
                  type="text"
                  name="shortName"
                  onChange={handleChange}
                  value={form.shortName}
                  required
                />
              </label>
            </div>
          </div>
          <div className="form-group fg-group">
            <label>
              Description:
              <input
                type="text"
                name="description"
                onChange={handleChange}
                value={form.description}
                required
              />
            </label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <label style={{ marginRight: "20px" }}>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={form.columnSettings.length === options.length}
                />
                Select All
              </label>
              <div style={{ display: "flex", gap: "20px" }}>
                {options.map((option, index) => (
                  <label
                    key={index}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <input
                      type="checkbox"
                      value={option}
                      checked={form.columnSettings.includes(option)}
                      onChange={() => handleCheckboxChange(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-row fg-group">
              <div className="form-group">
                <label>
                  Header Text:
                  <input
                    type="text"
                    name="headerText"
                    onChange={handleChange}
                    value={form.headerText}
                    required
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Footer Text:
                  <input
                    type="text"
                    name="footerText"
                    onChange={handleChange}
                    value={form.footerText}
                    required
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Display Sequence:
                  <input
                    type="number"
                    name="displaySequence"
                    onChange={handleChange}
                    value={form.displaySequence}
                    required
                  />
                </label>
              </div>
            </div>
          </div>

          <button type="submit">Add Lab Report Template</button>
        </form>
      </div>
    </div>
  );
};

export default LabReportTemplateModel;
