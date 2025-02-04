import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import "./styles/AddLabTest.css";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";
import LabTestComponentModel from "./LabTestComponentModel.jsx";
import AsyncSelect from "react-select/async";
import Loader from "../Loader.jsx";

const LabTestComponent = () => {
  const { setNotification, user } = useContext(AppContext);
  const [labCategories, setLabCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState(false);
  const [loadedData, setLoadedData] = useState({
    lookUpData: [],
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(null);

  useEffect(() => {
    getLookUpData();
  }, []);

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

  const editRef = useRef();

  useEffect(() => {
    fetchLabCategories();
  }, [currentPage, itemsPerPage]);

  const fetchLabCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/lab/get-components?page=${currentPage}&limit=${itemsPerPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setLabCategories(data.components);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLabCategory = async (labCategory) => {
    // console.log(labCategory);
    try {
      const res = await fetch(`${environment.url}/api/lab/add-component`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(labCategory),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        fetchLabCategories();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteLabCategory = async (labCategoryId) => {
    // console.log(labCategoryId);
    try {
      const res = await fetch(
        `${environment.url}/api/lab/delete-component/${labCategoryId}`,
        {
          method: "DELETE",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        fetchLabCategories();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    editRef.current.style.display = "none";
  };

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

  const handleEditing = (labCategory) => {
    // console.log(labCategory);
    editRef.current.style.display = "flex";
    setId(labCategory._id);
    setForm(labCategories.find((cat) => cat._id === labCategory._id));
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log(form);
    try {
      const res = await fetch(
        `${environment.url}/api/lab/edit-component/${id}`,
        {
          method: "PUT",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (res.ok) {
        fetchLabCategories();
        setNotification(data.message);
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <>
      <div className="upper-lab">
        <h2>All Lab Test Component</h2>
        {user?.role === "admin" && (
          <button onClick={() => setIsModalOpen(true)}>
            Add Lab Test Component
          </button>
        )}
      </div>
      {loading ? (
        <Loader />
      ) : (
        <div className="lower-lab">
          <table className="lab-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Display Name</th>
                <th>Unit</th>
                <th>Range</th>
                <th>Range Description</th>
                <th>Method</th>
                <th>ControlType</th>
                <th>ValueType</th>
                <th>ValueLookUp</th>
                {user?.role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {labCategories?.length > 0 ? (
                labCategories.map((cat) => (
                  <tr key={cat._id}>
                    <td>{cat.name}</td>
                    <td>{cat.displayName}</td>
                    <td>{cat.unit}</td>
                    <td>{`${cat.rangeDescription?.genRange?.min ?? ""}-${
                      cat.rangeDescription?.genRange?.max ?? ""
                    }`}</td>
                    <td>{cat.rangeDescription?.string}</td>
                    <td>{cat.method}</td>
                    <td>{cat.controlType}</td>
                    <td>{cat.valueType}</td>
                    <td>{cat.valueLookUpName}</td>
                    {user?.role === "admin" && (
                      <td
                        className="ipd-consumable-icon"
                        style={{ display: "flex", gap: "10px" }}
                      >
                        <FontAwesomeIcon
                          icon={faEdit}
                          onClick={() => handleEditing(cat)}
                          title="Edit"
                          className="icon"
                        />
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() => handleDeleteLabCategory(cat._id)}
                          title="Delete"
                          className="icon"
                        />
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" style={{ textAlign: "center" }}>
                    No Lab Test Conponent Available to Show
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination-controls">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Prev
        </button>
        <span style={{ margin: "0 15px" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      <LabTestComponentModel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddLabCategory={handleAddLabCategory}
      />

      <div className="edit-lab" ref={editRef}>
        <div className="modal-content">
          <button type="button" onClick={handleClose} className="opd-closeBtn">
            X
          </button>
          <h3>Edit Lab Test Component</h3>
          <form onSubmit={handleEditSubmit}>
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
            <div className="form-group fg-group">
              {/* This would be drop down */}

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
            </div>

            <button type="submit">Add Lab Test Component</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LabTestComponent;
