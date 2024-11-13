import React, { useContext, useEffect, useRef, useState } from "react";
import RoomModal from "./RoomModal";
import { AppContext } from "../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const Rooms = () => {
  const { setNotification } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    roomNumber: "",
    description: "",
    charges: "",
    capacity: "",
    roomType: "",
    wingName: "",
    wingId: ""
  });
  const [wings, setWings] = useState([]);

  useEffect(() => {
    fetchRooms();
    fetchWings();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/ipd/get-rooms", {
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
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const fetchWings = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/ipd/get-wings", {
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
    try {
      const res = await fetch("http://localhost:8000/api/ipd/add-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(room),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        setRooms((prevRooms) => [...prevRooms, data.room]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log(form);
    try {
      const res = await fetch(`http://localhost:8000/api/ipd/edit-room/${id}`,{
        method: "PUT",
        headers:{
          "Content-Type": "application/json",
          token: localStorage.getItem('token')
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if(res.ok){
        setRooms((prevRooms)=> prevRooms.map((room)=> room._id === id ? data.updatedRoom : room));
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
      charges: room.charges,
      capacity: room.capacity,
      roomType: room.roomType,
      wingName: room.wingName,
      wingId: room.wingId
    });
  };

  const handleDeleteRoom = async (roomId) => {
    // console.log(roomId);
    try {
      const res = await fetch(
        `http://localhost:8000/api/ipd/delete-room/${roomId}`,
        {
          method: "DELETE",
          headers: {
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
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleClose = () => {
    editRef.current.style.display = "none";
  };
  return (
    <>
      <div className="upper-wing">
        <h2>Rooms</h2>
        <button onClick={() => setIsModalOpen(true)}>Add Room</button>
      </div>
      <div className="lower-wing">
        <table className="wing-table">
          <thead>
            <tr>
              <th>Room Number</th>
              <th>Ward</th>
              <th>Description</th>
              <th>Room Type</th>
              <th>Charges</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <tr key={room._id}>
                  <td>{room.roomNumber}</td>
                  <td>{room.wingId.name}</td>
                  <td>{room.description}</td>
                  <td>{room.roomType}</td>
                  <td>{room.charges}</td>
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

      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddRoom={handleAddRoom}
      />

      <div className="edit-wing" ref={editRef}>
        <div className="modal-content">
          <button type="button" onClick={handleClose} className="closeBtn">
            X
          </button>
          <h3>Update Room</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="input-pair">
              <label>
                Room Number:
                <input
                  type="text"
                  name="roomNumber"
                  onChange={handleChange}
                  value={form.roomNumber}
                  required
                />
              </label>
              <label>
                Wing:
                <select
                  name="wingId"
                  onChange={handleChange}
                  value={form.wingId}
                  required
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

            <label>
              Room Type:
              <select
                name="roomType"
                onChange={handleChange}
                value={form.roomType}
                required
              >
                <option value="">Select Room Type</option>
                <option value="Private Room">Private Room</option>
                <option value="Shared Room">Shared Room</option>
                <option value="ICU">ICU</option>
                <option value="General Ward">General Ward</option>
              </select>
            </label>
            <label>
              Description:
              <textarea
                type="text"
                name="description"
                rows={10}
                onChange={handleChange}
                value={form.description}
                required
              />
            </label>
            <div className="input-pair">
              <label>
                Charges:
                <input
                  type="text"
                  name="charges"
                  onChange={handleChange}
                  value={form.charges}
                  required
                />
              </label>
              <label>
                Capacity:
                <input
                  type="text"
                  name="capacity"
                  onChange={handleChange}
                  value={form.capacity}
                  required
                />
              </label>
            </div>

            <button type="submit">Add Room</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Rooms;
