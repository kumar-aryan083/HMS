import React, { useContext, useEffect, useRef, useState } from "react";
import RoomModal from "./RoomModal";
import { AppContext } from "../../context/AppContext.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { environment } from "../../../utlis/environment.js";
import Loader from "../Loader.jsx";
import { getUserDetails } from "../../../utlis/userDetails.js";

const Rooms = () => {
  const { setNotification, user } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    roomNumber: "",
    description: "",
    capacity: "",
    roomType: "",
    wingName: "",
    wingId: "",
  });
  const [wings, setWings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRooms, setFilteredRooms] = useState([]);

  useEffect(() => {
    fetchRooms();
    fetchWings();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/ipd/get-rooms`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data.wings);
        setRooms(data.rooms);
        setFilteredRooms(data.rooms);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWings = async () => {
    try {
      const res = await fetch(`${environment.url}/api/ipd/get-wings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data.wings);
        setWings(data.wings);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [id, setId] = useState("");

  const editRef = useRef();

  const handleAddRoom = async (room) => {
    // console.log(wing);
    const userDetails = getUserDetails();
    const updatedForm = { ...room, ...userDetails };
    try {
      const res = await fetch(`${environment.url}/api/ipd/add-room`, {
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
        fetchRooms();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log(form);
    try {
      const res = await fetch(`${environment.url}/api/ipd/edit-room/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        fetchRooms();
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

  const handleEditing = (room) => {
    editRef.current.style.display = "flex";
    setId(room._id);
    setForm({
      roomNumber: room.roomNumber,
      description: room.description,
      capacity: room.capacity,
      roomType: room.roomType,
      wingName: room.wingName,
      wingId: room.wingId,
    });
  };

  const handleDeleteRoom = async (roomId) => {
    // console.log(roomId);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/delete-room/${roomId}`,
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
        setRooms((prevRooms) =>
          prevRooms.filter((room) => room._id !== data.deletedRoom._id)
        );
        setFilteredRooms((prevRooms) =>
          prevRooms.filter((room) => room._id !== data.deletedRoom._id)
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
      setFilteredRooms(rooms); // If search query is empty, show all wings
    } else {
      const searchResults = rooms.filter((room) =>
        room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRooms(searchResults); // Set filtered wings based on search query
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...filteredRooms]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

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
        <h2>Rooms</h2>
        <div className="search-bar" style={{ display: "flex", gap: "20px" }}>
          <input
            type="text"
            placeholder="Search by Room Name"
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
          <button onClick={() => setIsModalOpen(true)}>Add Room</button>
        )}
      </div>
      {loading ? (
        <Loader />
      ) : (
        <div className="lower-wing">
          <table className="wing-table">
            <thead>
              <tr>
                <th>Room Name</th>
                <th>Description</th>
                <th>Ward Type</th>
                {user?.role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((room) => (
                  <tr key={room._id}>
                    <td>{room.roomNumber}</td>
                    <td>{room.description}</td>
                    <td>{room.wingId.name}</td>
                    {user?.role === "admin" && (
                      <td className="wing-btn">
                        <FontAwesomeIcon
                          icon={faEdit}
                          onClick={() => handleEditing(room)}
                          title="Edit"
                          className="icon"
                        />
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() => handleDeleteRoom(room._id)}
                          title="Delete"
                          className="icon"
                        />
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
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

      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddRoom={handleAddRoom}
      />

      <div className="edit-wing" ref={editRef}>
        <div className="modal-content" style={{ height: "68%" }}>
          <button type="button" onClick={handleClose} className="opd-closeBtn">
            X
          </button>
          <h3>Update Room</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="form-row fg-group">
              <div className="form-group">
                <label>
                  Room Name:
                  <input
                    type="text"
                    name="roomNumber"
                    onChange={handleChange}
                    value={form.roomNumber}
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Wing:
                  <select
                    name="wingId"
                    onChange={handleChange}
                    value={form.wingId}
                  >
                    <option value="">Select Wing</option>
                    {wings.map((wing) => (
                      <option key={wing._id} value={wing._id}>
                        {wing.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-group">
                <label>
                  Capacity:
                  <input
                    type="text"
                    name="capacity"
                    onChange={handleChange}
                    value={form.capacity}
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Description:
                  <textarea
                    type="text"
                    name="description"
                    rows={5}
                    onChange={handleChange}
                    value={form.description}
                  />
                </label>
              </div>
            </div>

            <button type="submit">Update Room</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Rooms;
