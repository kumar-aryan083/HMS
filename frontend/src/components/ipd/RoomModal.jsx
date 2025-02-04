import React, { useEffect, useState } from "react";
import "./styles/WingModal.css";
import { environment } from "../../../utlis/environment.js";

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
      <div className="modal-content" style={{height: "67%"}}>
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3>Add New Room</h3>
        <form onSubmit={handleSubmit}>
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
          </div>

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

          <button type="submit">Add Room</button>
        </form>
      </div>
    </div>
  );
};

export default RoomModal;
