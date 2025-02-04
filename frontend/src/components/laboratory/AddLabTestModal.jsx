import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { environment } from "../../../utlis/environment";
// import "./styles/WingModal.css";

const AddLabTestModal = ({
  isOpen,
  onClose,
  onAddLabTest,
  preloadedData,
  form,
  handleChange,
  setForm,
}) => {
  if (!isOpen) return null;
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // console.log("PP: ", preloadedData);

  useEffect(() => {
    if (
      preloadedData.labTestComponents &&
      preloadedData.labTestComponents.length
    ) {
      setOptions(preloadedData.labTestComponents);
      setLoading(false);
    }
  }, [preloadedData.labTestComponents]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log("A: ", form);
    onAddLabTest(form);
    onClose();
  };
  // const isRailway = form.patientTypeName.toLowerCase() === "railway";

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3>Add New Lab Test</h3>
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
                Code:
                <input
                  type="text"
                  name="code"
                  onChange={handleChange}
                  value={form.code}
                  required
                />
              </label>
            </div>
          </div>

          <div className="form-row fg-group">
            {/* Reporting Name */}
            <div className="form-group fg-group">
              <label>
                Reporting Name:
                <input
                  type="text"
                  name="reportingName"
                  onChange={handleChange}
                  value={form.reportingName}
                  required
                />
              </label>
            </div>

            {/* Report Template */}
            <div className="form-group fg-group" style={{ gap: "0" }}>
              <label>Report Template:</label>
              <AsyncSelect
                cacheOptions
                loadOptions={(inputValue) => {
                  return Promise.resolve(
                    preloadedData.reportingTemps.filter((supplier) =>
                      supplier.label
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    )
                  );
                }}
                defaultOptions={preloadedData.reportingTemps} // Show all options initially
                value={preloadedData.reportingTemps.find(
                  (category) => category.value === form.reportTemp
                )}
                onChange={(e) => {
                  setForm({
                    ...form,
                    reportTemp: e?.value || "",
                    reportTempName: e?.label || "",
                  });
                }}
                placeholder="Select Report Template"
              />
            </div>
          </div>
          <div className="form-row fg-group">
            {/* Lab Category */}
            <div className="form-group fg-group">
              <label>Lab Category:</label>
              <AsyncSelect
                cacheOptions
                loadOptions={(inputValue) => {
                  return Promise.resolve(
                    preloadedData.labCategories.filter((supplier) =>
                      supplier.label
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    )
                  );
                }}
                defaultOptions={preloadedData.labCategories}
                value={preloadedData.labCategories.find(
                  (category) => category.value === form.labCategory
                )}
                onChange={(e) => {
                  setForm({
                    ...form,
                    labCategory: e?.value || "",
                    labCategoryName: e?.label || "",
                  });
                }}
                placeholder="Select Lab Category"
              />
            </div>

            {/* Department */}
            <div className="form-group fg-group">
              <label>Department:</label>
              <AsyncSelect
                cacheOptions
                loadOptions={(inputValue) => {
                  return Promise.resolve(
                    preloadedData.departments.filter((supplier) =>
                      supplier.label
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    )
                  );
                }}
                defaultOptions={preloadedData.departments}
                value={preloadedData.departments.find(
                  (category) => category.value === form.department
                )}
                onChange={(e) => {
                  setForm({
                    ...form,
                    department: e?.value || "",
                    departmentName: e?.label || "",
                  });
                }}
                placeholder="Select Department"
              />
            </div>
          </div>

          <div className="form-group fg-group" style={{ marginTop: "15px" }}>
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
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
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
                      padding: "0.5rem",
                      background: "#e74c3c",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
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
                    X
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
          {/* <div className="form-group fg-group">
            <label>
              Railway Category:
              <input
                type="text"
                name="railwayCategory"
                onChange={handleChange}
                value={form.railwayCategory}
              />
            </label>
          </div> */}
          {form.patientTypes?.find(
            (i) => i.patientTypeName?.toLowerCase() === "railway"
          ) && (
            <>
              <div className="form-row fg-group">
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
                      value={form.nabhPrice || ""}
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
                      value={form.nonNabhPrice || ""}
                    />
                  </label>
                </div>
              </div>
            </>
          )}
          <div className="form-row fg-group">
            <div className="form-group fg-group">
              <label>
                Display Sequence:
                <input
                  type="number"
                  name="displaySequence"
                  onChange={handleChange}
                  value={form.displaySequence}
                />
              </label>
            </div>
            <div className="form-group fg-group">
              <label>
                Run No. Type:
                <select
                  name="runNoType"
                  onChange={handleChange}
                  value={form.runNoType}
                >
                  <option value="normal">Normal</option>
                  <option value="cyto">Cyto</option>
                  <option value="histo">Histo</option>
                </select>
              </label>
            </div>
          </div>
          {/* <div className="form-group fg-group">
            <label>
              Specimen:
              <input
                type="text"
                name="specimen"
                onChange={handleChange}
                value={form.specimen}
              />
            </label>
          </div> */}
          <div className="form-group fg-group">
            <label>
              Interpretation:
              <textarea
                name="interpretation"
                onChange={handleChange}
                value={form.interpretation}
              />
            </label>
          </div>

          <label>
            Lab Test Components:
            {form.components.map((component, index) => (
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
                  {/* <AsyncSelect
                    loadOptions={(inputValue) => {
                      return Promise.resolve(
                        preloadedData.labTestComponents.filter((type) =>
                          type.label
                            .toLowerCase()
                            .includes(inputValue.toLowerCase())
                        )
                      );
                    }}
                    defaultOptions={preloadedData.labTestComponents}
                    value={preloadedData.labTestComponents.find(
                      (type) => type.value === patientType
                    )}
                    onChange={(e) => {
                      const updatedPatientTypes = [...form.components];
                      updatedPatientTypes[index] = e?.value || "";
                      setForm({ ...form, components: updatedPatientTypes });
                    }}
                    placeholder="Select LabTest Component"
                  /> */}
                  <select
                    id="options"
                    value={
                      options.find((type) => type.value === patientType)
                        ?.value || ""
                    }
                    onChange={(e) => {
                      const updatedPatientTypes = [...form.components];
                      updatedPatientTypes[index] = e.target.value || "";
                      setForm({ ...form, components: updatedPatientTypes });
                    }}
                    disabled={loading} // Disable select while loading
                  >
                    {loading ? (
                      <option>Loading...</option>
                    ) : (
                      options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))
                    )}
                  </select>
                  {/* <select
                    id="options"
                    value={component || ""}
                    onChange={(e) => {
                      const updatedComponents = [...form.components];
                      updatedComponents[index] = e.target.value;
                      setForm({ ...form, components: updatedComponents });
                    }}
                  >
                    <option value="" disabled>
                      Select a component
                    </option>
                    {preloadedData.labTestComponents.map((i) => (
                      <option key={i.value} value={i.value}>
                        {i.label}
                      </option>
                    ))}
                  </select> */}
                </div>
                {index > 0 && (
                  <button
                    type="button"
                    style={{
                      padding: "0.5rem",
                      background: "#e74c3c",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      width: "5%",
                    }}
                    onClick={() => {
                      const updatedComponents = form.components.filter(
                        (_, idx) => idx !== index
                      );
                      setForm({ ...form, components: updatedComponents });
                    }}
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </label>
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
                components: [...form.components, ""],
              })
            }
          >
            +
          </button>

          {/* Checkboxes */}
          {/* <div className="form-group fg-group">
              <label>
                <input
                  type="checkbox"
                  name="isSmsApplicable"
                  checked={form.isSmsApplicable}
                  onChange={handleChange}
                />
                SMS Applicable
              </label>
            </div>
            <div className="form-group fg-group">
              <label>
                <input
                  type="checkbox"
                  name="isLisApplicable"
                  checked={form.isLisApplicable}
                  onChange={handleChange}
                />
                LIS Applicable
              </label>
            </div>
            <div className="form-group fg-group">
              <label>
                <input
                  type="checkbox"
                  name="taxApplicable"
                  checked={form.taxApplicable}
                  onChange={handleChange}
                />
                Tax Applicable
              </label>
            </div>
            <div className="form-group fg-group">
              <label>
                <input
                  type="checkbox"
                  name="isOutsourcedTest"
                  checked={form.isOutsourcedTest}
                  onChange={handleChange}
                />
                Outsourced Test
              </label>
            </div> */}

          <button type="submit">Add Lab Test</button>
        </form>
      </div>
    </div>
  );
};

export default AddLabTestModal;
