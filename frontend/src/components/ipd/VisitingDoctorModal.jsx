import React, { useEffect, useState } from "react";
import "./styles/WingModal.css";
import { environment } from "../../../utlis/environment";
import AsyncSelect from "react-select/async";

const VisitingDoctorModal = ({
  isOpen,
  onClose,
  onAddDoctor,
  preloadedData,
  departments,
}) => {
  if (!isOpen) return null;
  const [form, setForm] = useState({
    doctorId: "",
    name: "",
    email: "",
    phone: "",
    specialization: "",
    department: "",
    departmentName: "",
    patientTypes: [
      {
        patientType: null,
        patientTypeName: "",
        generalFees: 0,
      },
    ],
    railwayCode: "",
    nabhPrice: "",
    nonNabhPrice: "",
  });
  const [doctorsList, setDoctorsList] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => {
      if (name === "patientType") {
        const selectedPatientType = patientTypes.find(
          (type) => type._id === value
        );
        return {
          ...prevForm,
          patientType: value,
          patientTypeName: selectedPatientType ? selectedPatientType.name : "",
          railwayCode: "",
          nabhPrice: "",
          nonNabhPrice: "",
        };
      }

      return {
        ...prevForm,
        [name]: value,
      };
    });
  };

  useEffect(() => {
    fetchDoctorsList();
  }, []);

  const fetchDoctorsList = async () => {
    try {
      const res = await fetch(`${environment.url}/api/employee/get-doctors`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setDoctorsList(data.doctors);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddDoctor(form);
    onClose();
  };

  const handleDoctorInput = (e) => {
    const { value } = e.target;
    setForm((prevData) => ({
      ...prevData,
      name: value,
    }));
    if (value.length > 2) {
      const filtered = doctorsList.filter((doctor) =>
        doctor.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setForm((prevData) => ({
      ...prevData,
      doctorId: doctor._id,
      name: doctor.name,
      email: doctor.email
    }));
    setFilteredDoctors([]);
  };

  const handleDepartmentChange = (e) => {
    const selectedDepartmentId = e.target.value;
    const selectedDepartment = departments.find(
      (dept) => dept._id === selectedDepartmentId
    );
    setForm((prevData) => ({
      ...prevData,
      department: selectedDepartmentId,
      departmentName: selectedDepartment.name,
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" >
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3>Add New Visiting Doctor</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group">
            <div className="form-group">
              <label className="form-label">
                Doctor Name:
                <input
                  className="form-input"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleDoctorInput}
                  placeholder="Search Doctor by Name"
                  autoComplete="off"
                  
                />
                {filteredDoctors.length > 0 && (
                  <ul className="autocomplete-dropdown">
                    {filteredDoctors.map((doctor) => (
                      <li
                        key={doctor._id}
                        onClick={() => handleDoctorSelect(doctor)}
                        className="dropdown-item"
                      >
                        {doctor.name} ({doctor.phone})
                      </li>
                    ))}
                  </ul>
                )}
              </label>
            </div>
            <div className="form-group">
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  className="vd-email"
                  readOnly
                />
              </label>
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Speciality:</label>
              <select
                name="specialization"
                onChange={handleChange}
                value={form.specialization}
                
              >
                <option value="">Select Specialization</option>
                <option value="ENT">ENT</option>
                <option value="Physician">Physician</option>
                <option value="Gynecology">Gynecology</option>
                <option value="General Surgery">General Surgery</option>
                <option value="Neurology">Neurology</option>
                <option value="Psychiatry">Psychiatry</option>
              </select>
            </div>
            <div className="form-group">
              <label>Department</label>
              <select
                value={form.department}
                onChange={handleDepartmentChange}
                
              >
                <option value="">Select Department</option>
                {departments?.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group fg-group">
            <label>Patient Types:</label>
            {form.patientTypes.map((patientType, index) => (
              <div
                key={index}
                className="row"
                style={{
                  display: "flex",
                  alignItems: "base-line",
                  gap: "1rem",
                  marginBottom: "1rem",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ flex: 2 }}>
                  <label style={{ display: "block", marginBottom: "0.9rem" }}>
                    Patient Type:
                  </label>
                  <AsyncSelect
                    styles={{ width: "70%" }}
                    cacheOptions
                    loadOptions={(inputValue) => {
                      return Promise.resolve(
                        preloadedData.patientTypes
                          .filter(
                            (i) =>
                              i.label !==
                              form.patientTypes.find(
                                (it) => it.patientTypeName === i.label
                              )?.patientTypeName
                          )
                          .filter((type) =>
                            type.label
                              .toLowerCase()
                              .includes(inputValue.toLowerCase())
                          )
                      );
                    }}
                    defaultOptions={preloadedData.patientTypes.filter(
                      (i) =>
                        i.label !==
                        form.patientTypes.find(
                          (it) => it.patientTypeName === i.label
                        )?.patientTypeName
                    )}
                    value={preloadedData.patientTypes.find(
                      (type) => type.value === patientType.type
                    )}
                    onChange={(e) => {
                      const updatedPatientTypes = [...form.patientTypes];
                      updatedPatientTypes[index] = {
                        ...updatedPatientTypes[index],
                        patientType: e?.value || "",
                        patientTypeName: e?.label || "",
                      };
                      setForm({ ...form, patientTypes: updatedPatientTypes });
                    }}
                    placeholder="Select Patient Type"
                  />
                </div>
                {form.patientTypes[index]?.patientTypeName?.toLowerCase() !==
                  "railway" && (
                  <div style={{ flex: 1, width: "10%" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>
                      General Fees:
                    </label>
                    <input
                      type="number"
                      name={`patientTypes[${index}].fees`}
                      value={form.patientTypes[index].generalFees || ""}
                      onChange={(e) => {
                        const updatedPatientTypes = [...form.patientTypes];
                        updatedPatientTypes[index] = {
                          ...updatedPatientTypes[index],
                          generalFees: e.target.value,
                        };
                        setForm({ ...form, patientTypes: updatedPatientTypes });
                      }}
                      placeholder="Fees"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                )}
                {index > 0 && (
                  <button
                    type="button"
                    style={{
                      padding: "7px 10px",
                      marginTop: "35px",
                      height: "fit-content",
                      background: "#e74c3c",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      width: "5%",
                    }}
                    onClick={() => {
                      const updatedPatientTypes = form.patientTypes.filter(
                        (_, idx) => idx !== index
                      );
                      setForm({ ...form, patientTypes: updatedPatientTypes });
                    }}
                  >
                    -
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              style={{
                padding: "0.5rem 1rem",
                background: "#3498db",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() =>
                setForm({
                  ...form,
                  patientTypes: [
                    ...form.patientTypes,
                    { patientType: null, patientTypeName: "", generalFees: 0 },
                  ],
                })
              }
            >
              +
            </button>
          </div>
          {form.patientTypes?.find(
            (i) => i.patientTypeName?.toLowerCase() === "railway"
          ) && (
            <>
              <div className="form-group fg-group">
                <label>
                  Railway Code:
                  <input
                    type="text"
                    name="railwayCode"
                    onChange={handleChange}
                    value={form.railwayCode}
                  />
                </label>
              </div>

              {/* NABH and Non-NABH Prices */}
              <div className="form-group fg-group">
                <label>
                  NABH Price:
                  <input
                    type="number"
                    name="nabhPrice"
                    onChange={handleChange}
                    value={form.nabhPrice}
                  />
                </label>
              </div>
              <div className="form-group fg-group">
                <label>
                  Non-NABH Price:
                  <input
                    type="number"
                    name="nonNabhPrice"
                    onChange={handleChange}
                    value={form.nonNabhPrice}
                  />
                </label>
              </div>
            </>
          )}

          <button type="submit">Add Visiting Doctor</button>
        </form>
      </div>
    </div>
  );
};

export default VisitingDoctorModal;
