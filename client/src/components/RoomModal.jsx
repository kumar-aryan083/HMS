import React, { useEffect, useState } from "react";
import "./styles/WingModal.css";

const RoomModal = ({ isOpen, onClose, onAddRoom }) => {
  if (!isOpen) return null;
  const [form, setForm] = useState({
    roomNumber: "",
    description: "",
    charges: "",
    capacity: "",
    roomType: "",
    wingId: "",
  });
  const [wings, setWings] = useState([]);

  useEffect(() => {
    fetchWings();
  }, []);

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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddRoom(form); // Callback to add the wing
    onClose(); // Close the modal after submission
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" onClick={onClose} className="closeBtn">
          X
        </button>
        <h3>Add New Room</h3>
        <form onSubmit={handleSubmit}>
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
  );
};

export default RoomModal;
