import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import "./styles/AddLabTest.css";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";
import LabCategoryModal from "./LabCategoryModal.jsx";
import LabLookUpModel from "./LabLookUpModel.jsx";
import LabVendorModel from "./LabVendorModel.jsx";
import Loader from "../Loader.jsx";

const LabVendor = () => {
  const { setNotification, user } = useContext(AppContext);
  const [labCategories, setLabCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
    contactNumber: "",
    email: "",
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
        `${environment.url}/api/lab/get-vendors?page=${currentPage}&limit=${itemsPerPage}`,
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
        setLabCategories(data.vendors);
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
      const res = await fetch(`${environment.url}/api/lab/add-vendor`, {
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
        `${environment.url}/api/lab/delete-vendor/${labCategoryId}`,
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
      const res = await fetch(`${environment.url}/api/lab/edit-vendor/${id}`, {
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
        <h2>All Lab Vendors</h2>
        {user?.role === "admin" && (
          <button onClick={() => setIsModalOpen(true)}>Add Lab Vendor</button>
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
                <th>Code</th>
                <th>Address</th>
                <th>Contact Number</th>
                <th>Email</th>
                {user?.role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {labCategories.length > 0 ? (
                labCategories.map((cat) => (
                  <tr key={cat._id}>
                    <td>{cat.name}</td>
                    <td>{cat.code}</td>
                    <td>{cat.address}</td>
                    <td>{cat.contactNumber}</td>
                    <td>{cat.email}</td>
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
                    No Lab Vendors Available to Show
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

      <LabVendorModel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddLabCategory={handleAddLabCategory}
      />

      <div className="edit-lab" ref={editRef}>
        <div className="modal-content" style={{ height: "65%" }}>
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
              <div className="form-group">
                <label>
                  Contact Number:
                  <input
                    type="text"
                    name="contactNumber"
                    onChange={handleChange}
                    value={form.contactNumber}
                    required
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Email:
                  <input
                    type="text"
                    name="email"
                    onChange={handleChange}
                    value={form.email}
                    required
                  />
                </label>
              </div>
            </div>
            <div className="form-group fg-group">
              <label>
                Address:
                <input
                  type="text"
                  name="address"
                  onChange={handleChange}
                  value={form.address}
                  required
                />
              </label>
            </div>

            <button type="submit">Add Lab Vendor</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LabVendor;
