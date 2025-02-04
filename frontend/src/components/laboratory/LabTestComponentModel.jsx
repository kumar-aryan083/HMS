import React, { useEffect, useState } from "react";
import { environment } from "../../../utlis/environment";
import AsyncSelect from "react-select/async";
// import "./styles/WingModal.css";

const LabTestComponentModel = ({ isOpen, onClose, onAddLabCategory }) => {
  const [loadedData, setLoadedData] = useState({
    lookUpData: [],
  });

  const [form, setForm] = useState({
    name: "",
    unit: "",
    valueType: "",
    controlType: "",
    rangeDescription: {
      string: "",
    },
    method: "",
    valueLookUp: "",
    valueLookUpName: "",
    displayName: "",
    valuePrecision: "",
  });

  useEffect(() => {
    getLookUpData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "valueType" && value === "text") {
      setForm((prevForm) => ({
        ...prevForm,
        rangeDescription: {
          ...prevForm.rangeDescription,
          genRange: undefined,
          maleRange: undefined,
          femaleRange: undefined,
          childRange: undefined,
        },
      }));
    }
    switch (name) {
      case "genMinValue":
        setForm((prevForm) => ({
          ...prevForm,
          rangeDescription: {
            ...prevForm.rangeDescription,
            genRange: {
              ...prevForm.rangeDescription.genRange,
              min: value,
            },
          },
        }));
        break;
      case "genMaxValue":
        setForm((prevForm) => ({
          ...prevForm,
          rangeDescription: {
            ...prevForm.rangeDescription,
            genRange: {
              ...prevForm.rangeDescription.genRange,
              max: value,
            },
          },
        }));
        break;
      case "maleMinValue":
        setForm((prevForm) => ({
          ...prevForm,
          rangeDescription: {
            ...prevForm.rangeDescription,
            maleRange: {
              ...prevForm.rangeDescription.maleRange,
              min: value,
            },
          },
        }));
        break;
      case "maleMaxValue":
        setForm((prevForm) => ({
          ...prevForm,
          rangeDescription: {
            ...prevForm.rangeDescription,
            maleRange: {
              ...prevForm.rangeDescription.maleRange,
              max: value,
            },
          },
        }));
        break;
      case "femaleMinValue":
        setForm((prevForm) => ({
          ...prevForm,
          rangeDescription: {
            ...prevForm.rangeDescription,
            femaleRange: {
              ...prevForm.rangeDescription.femaleRange,
              min: value,
            },
          },
        }));
        break;
      case "femaleMaxValue":
        setForm((prevForm) => ({
          ...prevForm,
          rangeDescription: {
            ...prevForm.rangeDescription,
            femaleRange: {
              ...prevForm.rangeDescription.femaleRange,
              max: value,
            },
          },
        }));
        break;
      case "childMinValue":
        setForm((prevForm) => ({
          ...prevForm,
          rangeDescription: {
            ...prevForm.rangeDescription,
            childRange: {
              ...prevForm.rangeDescription.childRange,
              min: value,
            },
          },
        }));
        break;
      case "childMaxValue":
        setForm((prevForm) => ({
          ...prevForm,
          rangeDescription: {
            ...prevForm.rangeDescription,
            childRange: {
              ...prevForm.rangeDescription.childRange,
              max: value,
            },
          },
        }));
        break;
      case "rangeDescription":
        setForm((prevForm) => ({
          ...prevForm,
          rangeDescription: {
            ...prevForm.rangeDescription,
            string: value,
          },
        }));
        break;
      default:
        setForm((prevForm) => ({
          ...prevForm,
          [name]: value,
        }));
        break;
    }
  };

  const getLookUpData = async () => {
    try {
      const res = await fetch(`${environment.url}/api/lab/get-lookups`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        const options = data.lookUps.map((lookUp) => ({
          value: lookUp._id,
          label: lookUp.lookupName,
        }));
        setLoadedData({
          lookUpData: options,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddLabCategory(form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3>Add New Lab Test Component</h3>
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
                Unit:
                <input
                  type="text"
                  name="unit"
                  onChange={handleChange}
                  value={form.unit}
                  required
                />
              </label>
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              {/* This would be drop down */}
              <label>
                Value Type:
                <select
                  name="valueType"
                  onChange={handleChange}
                  value={form.valueType}
                  required
                >
                  <option value="">Select Value Type</option>
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                </select>
              </label>
            </div>
            <div className="form-group">
              <label>
                Control Type:
                <select
                  name="controlType"
                  onChange={handleChange}
                  value={form.controlType}
                  required
                >
                  <option value="">Select Control Type</option>
                  <option value="searchBox">SearchBox</option>
                  <option value="textBox">TextBox</option>
                  <option value="label">Label</option>
                </select>
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>
              Range Description:
              <input
                type="text"
                name="rangeDescription"
                onChange={handleChange}
                value={form?.rangeDescription?.string}
                required
              />
            </label>
          </div>
          {form.valueType === "number" && (
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div>
                <p>Gen Range: </p>
                <label>
                  Min Value:
                  <input
                    type="number"
                    name="genMinValue"
                    onChange={handleChange}
                    value={form.rangeDescription?.genRange?.min}
                    required
                  />
                </label>
                <label>
                  Max Value:
                  <input
                    type="number"
                    name="genMaxValue"
                    onChange={handleChange}
                    value={form.rangeDescription?.genRange?.max}
                    required
                  />
                </label>
              </div>
              <div>
                <p>Male Range:</p>
                <label>
                  Min Value:
                  <input
                    type="number"
                    name="maleMinValue"
                    onChange={handleChange}
                    value={form.rangeDescription?.maleRange?.min}
                    required
                  />
                </label>
                <label>
                  Max Value:
                  <input
                    type="number"
                    name="maleMaxValue"
                    onChange={handleChange}
                    value={form.rangeDescription?.maleRange?.max}
                    required
                  />
                </label>
              </div>
              <div>
                <p>Female Range:</p>
                <label>
                  Min Value:
                  <input
                    type="number"
                    name="femaleMinValue"
                    onChange={handleChange}
                    value={form.rangeDescription?.femaleRange?.min}
                    required
                  />
                </label>
                <label>
                  Max Value:
                  <input
                    type="number"
                    name="femaleMaxValue"
                    onChange={handleChange}
                    value={form.rangeDescription?.femaleRange?.max}
                    required
                  />
                </label>
              </div>
              <div>
                <p>Child Range:</p>
                <label>
                  Min Value:
                  <input
                    type="number"
                    name="childMinValue"
                    onChange={handleChange}
                    value={form.rangeDescription?.childRange?.min}
                    required
                  />
                </label>
                <label>
                  Max Value:
                  <input
                    type="number"
                    name="childMaxValue"
                    onChange={handleChange}
                    value={form.rangeDescription?.childRange?.max}
                    required
                  />
                </label>
              </div>
            </div>
          )}
          <div className="form-row fg-group">
            <div className="form-group">
              <label>
                Method:
                <input
                  type="text"
                  name="method"
                  onChange={handleChange}
                  value={form.method}
                  required
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Value LookUp:
                <AsyncSelect
                  cacheOptions
                  loadOptions={(inputValue) => {
                    return Promise.resolve(
                      loadedData.lookUpData.filter((supplier) =>
                        supplier.label
                          .toLowerCase()
                          .includes(inputValue.toLowerCase())
                      )
                    );
                  }}
                  defaultOptions={loadedData.lookUpData} // Show all options initially
                  value={loadedData.lookUpData.find(
                    (category) => category.value === form.valueLookUp
                  )}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      valueLookUp: e?.value || "",
                      valueLookUpName: e?.label || "",
                    });
                  }}
                  placeholder="Select LookUps"
                  isClearable
                />
              </label>
            </div>
          </div>

          <div className="form-row fg-group">
            <div className="form-group">
              <label>Display Name:</label>
              <input
                type="text"
                name="displayName"
                onChange={handleChange}
                value={form.displayName}
                required
              />
            </div>
            <div className="form-group">
              <label>Value Precision:</label>
              <input
                type="text"
                name="valuePrecision"
                onChange={handleChange}
                value={form.valuePrecision}
                required
              />
            </div>
          </div>

          <button type="submit">Add Lab Test Component</button>
        </form>
      </div>
    </div>
  );
};

export default LabTestComponentModel;
