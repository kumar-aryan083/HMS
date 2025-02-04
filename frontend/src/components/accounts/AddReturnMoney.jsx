import React, { useEffect, useState } from "react";
import { environment } from "../../../utlis/environment";

const AddReturnMoney = ({ isOpen, onClose, onAddReturnMoney, patients, patientData }) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    amount: "",
    remarks: "",
    returnDate: "",
  });
  const [filteredPatients, setFilteredPatients] = useState([]);

  useEffect(() => {
    // fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handlePatientInput = (e) => {
    const { value } = e.target;
    setForm((prevData) => ({
      ...prevData,
      patientName: value,
    }));

    if (value.length >= 3) {
      const filtered = patients.filter((patient) =>
        patient.patientName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients([]);
    }
  };

  const handlePatientSelect = (patient) => {
    setForm((prevData) => ({
      ...prevData,
      patientId: patient._id,
      patientName: `${patient.patientName}`,
    }));
    setFilteredPatients([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log("Form Submission:", form);
    onAddReturnMoney(form);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "700px" }}>
        <button type="button" onClick={onClose} className="closeBtn">
          X
        </button>
        <h3>Add Money for return</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Patient Name:</label>
              <input
                className="form-input"
                type="text"
                name="patientName"
                value={patientData.name}
                // onChange={handlePatientInput}
                // placeholder="Search Patient by Name"
                readOnly
                autoComplete="off"
              />
              {/* {filteredPatients.length > 0 && (
                <ul className="autocomplete-dropdown">
                  {filteredPatients.map((patient) => (
                    <li
                      key={patient._id}
                      onClick={() => handlePatientSelect(patient)}
                      className="dropdown-item"
                    >
                      {patient.patientName} ({patient.uhid})
                    </li>
                  ))}
                </ul>
              )} */}
            </div>
            <div className="form-group">
              <label>Amount:</label>
              <input
                type="number"
                name="amount"
                onChange={handleChange}
                value={form.amount}
              />
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Return Date:</label>
              <input
                type="date"
                name="returnDate"
                onChange={handleChange}
                value={form.returnDate}
              />
            </div>
            <div className="form-group">
              <label>Remarks:</label>
              <input
                type="text"
                name="remarks"
                onChange={handleChange}
                value={form.remarks}
              />
            </div>
          </div>

          <button type="submit">Add Money</button>
        </form>
      </div>
    </div>
  );
};

export default AddReturnMoney;
