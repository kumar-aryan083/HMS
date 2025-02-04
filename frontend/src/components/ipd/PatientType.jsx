import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../context/AppContext";
import PatientTypeModal from "./PatientTypeModal";
import { environment } from "../../../utlis/environment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Loader from "../Loader";
import { getUserDetails } from "../../../utlis/userDetails";

const PatientType = () => {
  const { setNotification, user } = useContext(AppContext);
  const [patientTypes, setPatientTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState(false);
  const [form, setForm] = useState({
    name: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTypes, setFilteredTypes] = useState([]);

  const editRef = useRef();

  useEffect(() => {
    fetchPatientTypes();
  }, []);

  const fetchPatientTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/common/get-patient-type`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setPatientTypes(data.patientTypes);
        setFilteredTypes(data.patientTypes);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddType = async (type) => {
    // console.log(type);
    const userDetails = getUserDetails();
    const updatedForm = { ...type, ...userDetails };
    try {
      const res = await fetch(
        `${environment.url}/api/common/add-patient-type`,
        {
          method: "POST",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(updatedForm),
        }
      );
      const data = await res.json();
      if (res.ok) {
        fetchPatientTypes();
        setIsModalOpen(false);
        setNotification(data.message);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  const handleDeletePatientType = async (typeId) => {
    // console.log(typeId);
    try {
      const res = await fetch(
        `${environment.url}/api/common/delete-patient-type/${typeId}`,
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
        setPatientTypes((prevTypes) =>
          prevTypes.filter((type) => type._id !== data.deletedType._id)
        );
        setFilteredTypes((prevTypes) =>
          prevTypes.filter((type) => type._id !== data.deletedType._id)
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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditing = (type) => {
    // console.log(type);
    editRef.current.style.display = "flex";
    setId(type._id);
    setForm({
      name: type.name,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log(form);
    try {
      const res = await fetch(
        `${environment.url}/api/common/edit-patient-type/${id}`,
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
        setPatientTypes((preTypes) =>
          preTypes.map((type) => (type._id === id ? data.updatedType : type))
        );
        setFilteredTypes((preTypes) =>
          preTypes.map((type) => (type._id === id ? data.updatedType : type))
        );
        setNotification(data.message);
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = () => {
    if (searchQuery === "") {
      setFilteredTypes(patientTypes); // If search query is empty, show all wings
    } else {
      const searchResults = patientTypes.filter((type) =>
        type.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTypes(searchResults); // Set filtered wings based on search query
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...filteredTypes]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTypes.length / itemsPerPage);

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
      <div className="upper-wing">
        <h2>Patient Types</h2>
        <div className="search-bar" style={{ display: "flex", gap: "20px" }}>
          <input
            type="text"
            placeholder="Search by Type Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ margin: "auto 0" }}
          />
          <button
            onClick={handleSearch}
            style={{ margin: "auto 0", width: "fit-content" }}
          >
            Search
          </button>
        </div>
        {user?.role === "admin" && (
          <button onClick={() => setIsModalOpen(true)}>Add Patient Type</button>
        )}
      </div>
      {loading ? (
        <Loader />
      ) : (
        <div className="lower-wing">
          <table className="wing-table">
            <thead>
              <tr>
                <th>Name</th>
                {user?.role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((type) => (
                  <tr key={type._id}>
                    <td>{type.name}</td>
                    {user?.role === "admin" && (
                      <td className="wing-btn">
                        <FontAwesomeIcon
                          icon={faEdit}
                          onClick={() => handleEditing(type)}
                          title="Edit"
                          className="icon"
                        />
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() => handleDeletePatientType(type._id)}
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
                    No Patient Type Available to Show
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

      <PatientTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddType={handleAddType}
      />

      <div className="edit-wing" ref={editRef}>
        <div
          className="modal-content"
          style={{ width: "400px", height: "36%" }}
        >
          <button type="button" onClick={handleClose} className="opd-closeBtn">
            X
          </button>
          <h3>Edit Patient Type</h3>
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
                  />
                </label>
              </div>
            </div>

            <button type="submit">Update Patient Type</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PatientType;
