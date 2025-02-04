import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import "./styles/AddLabTest.css";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";
import LabReportTemplateModel from "./LabReportTemplateModel.jsx";
import Loader from "../Loader.jsx";

const LabReportTemplate = () => {
  const { setNotification, user } = useContext(AppContext);
  const [labCategories, setLabCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState(false);
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
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(null);

  const options = ["Name", "Result", "Range", "Method", "Unit", "Remarks"];

  const editRef = useRef();

  useEffect(() => {
    fetchLabCategories();
  }, [currentPage, itemsPerPage]);

  const fetchLabCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/lab/get-lab-temps?page=${currentPage}&limit=${itemsPerPage}`,
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
        setLabCategories(data.labTemps);
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
      const res = await fetch(`${environment.url}/api/lab/add-lab-temp`, {
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
        `${environment.url}/api/lab/delete-lab-temp/${labCategoryId}`,
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
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleEditing = (labCategory) => {
    // console.log(labCategory);
    editRef.current.style.display = "flex";
    setId(labCategory._id);
    setForm(labCategories.find((cat) => cat._id === labCategory._id));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log(form);
    try {
      const res = await fetch(
        `${environment.url}/api/lab/edit-lab-temp/${id}`,
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
        <h2>All Lab Report Template</h2>
        {user?.role === "admin" && (
          <button onClick={() => setIsModalOpen(true)}>
            Add Lab Report Template
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
                <th>Short Name</th>
                <th>Column Settings</th>
                <th>Display Sequence</th>
                {user?.role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {labCategories.length > 0 ? (
                labCategories.map((cat) => (
                  <tr key={cat._id}>
                    <td>{cat.name}</td>
                    <td>{cat.shortName}</td>
                    <td>
                      {Array.isArray(cat.columnSettings) ? (
                        <span>
                          [
                          {cat.columnSettings.map((item, index) => (
                            <React.Fragment key={index}>
                              {item}
                              {index < cat.columnSettings.length - 1 && ", "}
                            </React.Fragment>
                          ))}
                          ]
                        </span>
                      ) : (
                        <span>{cat.columnSettings}</span>
                      )}
                    </td>
                    <td>{cat.displaySequence}</td>
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
                    No Lab Report Template Available to Show
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

      <LabReportTemplateModel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddLabCategory={handleAddLabCategory}
      />

      <div className="edit-lab" ref={editRef}>
        <div className="modal-content" style={{ height: "80%" }}>
          <button type="button" onClick={handleClose} className="opd-closeBtn">
            X
          </button>
          <h3>Edit Lab Report Template</h3>
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
    </>
  );
};

export default LabReportTemplate;
