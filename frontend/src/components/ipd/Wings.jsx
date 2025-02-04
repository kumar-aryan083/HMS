import React, { useContext, useEffect, useRef, useState } from "react";
import "./styles/Wings.css";
import WingModal from "./WingModal";
import { AppContext } from "../../context/AppContext.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faL, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { environment } from "../../../utlis/environment.js";
import Loader from "../Loader.jsx";
import { getUserDetails } from "../../../utlis/userDetails.js";

const Wings = () => {
  const { setNotification, user } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wings, setWings] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [id, setId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredWings, setFilteredWings] = useState([]);

  const editRef = useRef();

  useEffect(() => {
    fetchWings();
  }, []);

  const fetchWings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/ipd/get-wings`, {
        method: "GET",
        headers: {
          "x-tenant-id": environment.tenantId,
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data.wings);
        setWings(data.wings);
        setFilteredWings(data.wings);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWing = async (wing) => {
    // console.log(wing);
    const userDetails = getUserDetails();
    const updatedForm = { ...wing, ...userDetails };
    try {
      const res = await fetch(`${environment.url}/api/ipd/create-wing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(updatedForm),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        setWings((prevWings) => [...prevWings, data.newWing]);
        setFilteredWings((prevWings) => [...prevWings, data.newWing]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log(form);
    try {
      const res = await fetch(`${environment.url}/api/ipd/edit-wing/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setWings((prevWing) =>
          prevWing.map((wing) => (wing._id === id ? data.updatedWing : wing))
        );
        setFilteredWings((prevWing) =>
          prevWing.map((wing) => (wing._id === id ? data.updatedWing : wing))
        );
        setNotification(data.message);
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditing = (wing) => {
    editRef.current.style.display = "flex";
    setId(wing._id);
    setForm({
      name: wing.name,
      description: wing.description,
    });
  };

  const handleDeleteWing = async (wingId) => {
    // console.log(wingId);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/delete-wing/${wingId}`,
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
        setWings((prevWings) =>
          prevWings.filter((wing) => wing._id !== data.deletedWing._id)
        );
        setFilteredWings((prevWings) =>
          prevWings.filter((wing) => wing._id !== data.deletedWing._id)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleClose = () => {
    editRef.current.style.display = "none";
  };

  const handleSearch = () => {
    if (searchQuery === "") {
      setFilteredWings(wings); // If search query is empty, show all wings
    } else {
      const searchResults = wings.filter((wing) =>
        wing.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWings(searchResults); // Set filtered wings based on search query
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...filteredWings]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredWings.length / itemsPerPage);

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
        <h2>Wings</h2>
        <div className="search-bar" style={{ display: "flex", gap: "20px" }}>
          <input
            type="text"
            placeholder="Search by Wing Name"
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
          <button onClick={() => setIsModalOpen(true)}>Add Wing</button>
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
                <th>Description</th>
                <th className="wings-rooms">Total Rooms</th>
                {user?.role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((wing) => (
                  <tr key={wing._id}>
                    <td>{wing.name}</td>
                    <td>{wing.description}</td>
                    <td className="wings-rooms">{wing.rooms.length}</td>
                    {user?.role === "admin" && (
                      <td className="wing-btn">
                        <FontAwesomeIcon
                          icon={faEdit}
                          onClick={() => handleEditing(wing)}
                          title="Edit"
                          className="icon"
                        />
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() => handleDeleteWing(wing._id)}
                          title="Delete"
                          className="icon"
                        />
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No Wings Available to Show
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

      <WingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddWing={handleAddWing}
      />

      <div className="edit-wing" ref={editRef}>
        <div className="modal-content" style={{ height: "74%" }}>
          <button type="button" onClick={handleClose} className="opd-closeBtn">
            X
          </button>
          <h3>Update Wing</h3>
          <form onSubmit={handleEditSubmit}>
            <label>
              Wing Name:
              <input
                type="text"
                name="name"
                onChange={handleChange}
                value={form.name}
              />
            </label>
            <label>
              Description:
              <textarea
                type="text"
                name="description"
                rows={10}
                onChange={handleChange}
                value={form.description}
              />
            </label>
            <button type="submit">Update Wing</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Wings;
