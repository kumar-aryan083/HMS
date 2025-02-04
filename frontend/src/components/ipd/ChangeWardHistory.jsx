import React, { useState, useEffect, useContext } from "react";
import "./styles/ChangeWardHistory.css";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";

const ChangeWardHistory = ({
  admissionId,
  toggleWardHistoryPopup,
  onAssign,
}) => {
  const { setNotification } = useContext(AppContext);
  const [formData, setFormData] = useState({
    wingId: "",
    roomId: "",
    bedId: "",
  });

  const [wings, setWings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [wingsRes, roomsRes] = await Promise.all([
        fetch(`${environment.url}/api/ipd/get-wings`, {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            token: localStorage.getItem("token"),
          },
        }),
        fetch(`${environment.url}/api/ipd/get-rooms`, {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            token: localStorage.getItem("token"),
          },
        }),
      ]);

      const wingsData = await wingsRes.json();
      const roomsData = await roomsRes.json();

      setWings(wingsData.wings);
      setRooms(roomsData.rooms);
    } catch (error) {
      console.error("Error fetching data:", error);
      setNotification("Error fetching wing or room data.");
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "wingId") {
      const filtered = rooms.filter((room) => room.wingId._id === value);
      setFilteredRooms(filtered);
      setFormData((prevData) => ({ ...prevData, roomId: "", bedId: "" }));
      setBeds([]);
    }

    if (name === "roomId") {
      const selectedRoom = rooms.find((room) => room._id === value);
      if (selectedRoom) {
        setBeds(selectedRoom.beds.filter((bed) => !bed.isOccupied));
      } else {
        setBeds([]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(formData);
    try {
      const response = await fetch(
        `${environment.url}/api/ipd/${admissionId}/add-ward-history`,
        {
          method: "PUT",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();

      if (response.ok) {
        setNotification("Ward history updated successfully.");
        onAssign();
        toggleWardHistoryPopup();
      } else {
        setNotification(data.message || "Failed to update ward history.");
      }
    } catch (error) {
      console.error("Error updating ward history:", error);
      setNotification("An error occurred while updating ward history.");
    }
  };

  return (
    <form className="change-ward-history-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Change Ward History</h2>
      <div className="form-row">
        <label className="form-label">
          Wing:
          <select
            className="form-select"
            name="wingId"
            value={formData.wingId}
            onChange={handleInputChange}
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
        <label className="form-label">
          Room:
          <select
            className="form-select"
            name="roomId"
            value={formData.roomId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Room</option>
            {filteredRooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.roomNumber}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          Bed:
          <select
            className="form-select"
            name="bedId"
            value={formData.bedId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Bed</option>
            {beds.map((bed) => (
              <option key={bed._id} value={bed._id}>
                {bed.bedName}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button className="form-submit-button" type="submit">
        Update Ward History
      </button>
    </form>
  );
};

export default ChangeWardHistory;
