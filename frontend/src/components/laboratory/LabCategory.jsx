import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import "./styles/AddLabTest.css";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";
import LabCategoryModal from "./LabCategoryModal.jsx";
import Loader from "../Loader.jsx";

const LabCategory = () => {
  const { setNotification, user } = useContext(AppContext);
  const [labCategories, setLabCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState(false);
  const [form, setForm] = useState({
    name: "",
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
        `${environment.url}/api/lab/get-lab-categories?page=${currentPage}&limit=${itemsPerPage}`,
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
        // console.log(data);
        setLabCategories(data.labCategories);
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
      const res = await fetch(`${environment.url}/api/lab/add-lab-category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
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
        `${environment.url}/api/lab/delete-lab-category/${labCategoryId}`,
        {
          method: "DELETE",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setLabCategories((prevCat) =>
          prevCat.filter((cat) => cat._id !== data.deletedType._id)
        );
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
    setForm({
      name: labCategory.name,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log(form);
    try {
      const res = await fetch(
        `${environment.url}/api/lab/edit-lab-category/${id}`,
        {
          method: "PUT",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
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
        <h2>All Lab Categories</h2>
        {user?.role === "admin" && (
          <button onClick={() => setIsModalOpen(true)}>Add Lab Category</button>
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
                {user?.role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {labCategories.length > 0 ? (
                labCategories.map((cat) => (
                  <tr key={cat._id}>
                    <td>{cat.name}</td>
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
                    No Lab Categories Available to Show
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

      <LabCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddLabCategory={handleAddLabCategory}
      />

      <div className="edit-lab" ref={editRef}>
        <div className="modal-content" style={{ height: "40%", width: "30%" }}>
          <button type="button" onClick={handleClose} className="opd-closeBtn">
            X
          </button>
          <h3>Edit Lab Category</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="form-group fg-group">
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

            <button type="submit">Update Lab Category</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LabCategory;
