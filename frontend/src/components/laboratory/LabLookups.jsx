import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import "./styles/AddLabTest.css";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";
import LabCategoryModal from "./LabCategoryModal.jsx";
import LabLookUpModel from "./LabLookUpModel.jsx";
import Loader from "../Loader.jsx";

const LabLookups = () => {
  const { setNotification, user } = useContext(AppContext);
  const [labCategories, setLabCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState(false);
  const [form, setForm] = useState({
    lookupName: "",
    description: "",
    lookUpData: [""],
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(null);

  const editRef = useRef();

  useEffect(() => {
    fetchLabCategories();
  }, [currentPage, itemsPerPage]);

  const fetchLabCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/lab/get-lookups?page=${currentPage}&limit=${itemsPerPage}`,
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
        setLabCategories(data.lookUps);
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
      const res = await fetch(`${environment.url}/api/lab/add-lookup`, {
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
        `${environment.url}/api/lab/delete-lookup/${labCategoryId}`,
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

  const handleEditing = (labCategory) => {
    // console.log(labCategory);
    editRef.current.style.display = "flex";
    setId(labCategory._id);
    setForm({
      lookupName: labCategory.lookupName,
      description: labCategory.description,
      lookUpData: labCategory.lookUpData,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log(form);
    try {
      const res = await fetch(`${environment.url}/api/lab/edit-lookup/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(form),
      });
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
        <h2>All Lab LookUps</h2>
        {user?.role === "admin" && (
          <button onClick={() => setIsModalOpen(true)}>Add Lab LookUps</button>
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
                <th>Description</th>
                <th>Data</th>
                {user?.role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {labCategories.length > 0 ? (
                labCategories.map((cat) => (
                  <tr key={cat._id}>
                    <td>{cat.lookupName}</td>
                    <td>{cat.description}</td>
                    <td>
                      {Array.isArray(cat.lookUpData) ? (
                        <span>
                          [
                          {cat.lookUpData.map((item, index) => (
                            <React.Fragment key={index}>
                              {item}
                              {index < cat.lookUpData.length - 1 && ", "}
                            </React.Fragment>
                          ))}
                          ]
                        </span>
                      ) : (
                        <span>{cat.lookUpData}</span>
                      )}
                    </td>
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
                    No Lab LookUps Available to Show
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

      <LabLookUpModel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddLabCategory={handleAddLabCategory}
      />

      <div className="edit-lab" ref={editRef}>
        <div className="modal-content" style={{ height: "60%" }}>
          <button type="button" onClick={handleClose} className="opd-closeBtn">
            X
          </button>
          <h3>Edit Lab LookUp</h3>
          <form onSubmit={handleEditSubmit}>
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
            <div className="form-group fg-group">
              <label>
                Data:
                {form.lookUpData?.map((dataField, index) => (
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
    </>
  );
};

export default LabLookups;
