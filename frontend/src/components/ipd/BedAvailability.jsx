import React, { useContext, useEffect, useState } from "react";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
// Custom bed icon SVG component
const BedIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
  </svg>
);
// Custom activity icon SVG component
const ActivityIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
const Badge = ({ variant, children }) => (
  <span className={`badge ${variant}`}>{children}</span>
);
const BedAvailability = () => {
  const { setNotification } = useContext(AppContext);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmData, setConfirmData] = useState(null); // Stores data for confirmation modal

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${environment.url}/api/ipd/get-rooms`, {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        });
        const data = await response.json();
        setRooms(data.rooms);
      } catch (err) {
        setError("Failed to fetch room data");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleBedClick = (room, bed, index) => {
    if (bed.isOccupied) {
      setConfirmData({
        wingId: room.wingId?._id,
        roomId: room._id,
        bedName: bed.bedName,
      });
    }
  };

  const confirmFreeBed = async () => {
    if (!confirmData) return;

    // console.log("confirmData:", confirmData);

    try {
      const response = await fetch(
        `${environment.url}/api/ipd/room-occupancy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(confirmData),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setNotification(data.message);
        // console.log("data", data);
        // Update the room state immediately after the bed is freed
        setRooms((prevRooms) => {
          const updatedRooms = prevRooms.map((room) => {
            if (room._id === confirmData.roomId) {
              // console.log(`Updating room with ID: ${room._id}`); 
              return {
                ...room,
                beds: room.beds.map((bed) => {
                  if (bed.bedName === confirmData.bedName) {
                    // console.log(`Updating bed: ${bed.bedName}`); 
                    return { ...bed, isOccupied: false }; // Free the bed
                  }
                  return bed;
                }),
              };
            }
            return room;
          });
  
          // console.log("Updated rooms:", updatedRooms); 
          return updatedRooms;
        });
      } else {
        setNotification(data.message);
      }
    } catch (err) {
      setNotification("internal server error");
    }

    setConfirmData(null);
  };

  const Bed = ({ isOccupied, name, onClick }) => (
    <div
      className={`bed ${isOccupied ? "occupied" : "available"}`}
      onClick={onClick}
    >
      <BedIcon className="bed-icon" />
      <span className="bed-tooltip">
        {name} - {isOccupied ? "Occupied" : "Available"}
      </span>
    </div>
  );

  const RoomCard = ({ room }) => {
    const occupiedBeds = room.beds.filter((bed) => bed.isOccupied).length;
    const totalBeds = room.beds.length;
    const occupancyPercentage = (occupiedBeds / totalBeds) * 100;
    return (
      <div className="card">
        <div className="card-header">
          <div className="room-header">
            <h2 className="room-title">Room {room.roomNumber}</h2>
            <Badge variant={occupancyPercentage >= 80 ? "critical" : "normal"}>
              {occupiedBeds}/{totalBeds} Beds
            </Badge>
          </div>
          <div className="room-info">
            <span className="room-type">
              <ActivityIcon className="activity-icon" />
              {room.roomType}
            </span>
            <span className="separator">•</span>
            <span>Wing: {room.wingId?.name || "N/A"}</span>
          </div>
        </div>
        <div className="card-content">
          <div className="beds-container">
            {room.beds.map((bed, index) => (
              <Bed
                key={index}
                isOccupied={bed.isOccupied}
                name={bed.bedName || `Bed ${index + 1}`}
                onClick={() => handleBedClick(room, bed, index)}
              />
            ))}
          </div>
        </div>
        {/* Confirmation Modal */}
        {confirmData && (
          <div className="modal">
            <div className="modal-content">
              <h3>Are you sure you want to free this bed?</h3>
              <div className="modal-actions">
                <button className="btn-confirm" onClick={confirmFreeBed}>
                  Yes
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => setConfirmData(null)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  return (
    <div className="rooms-layout">
      {rooms.map((room) => (
        <RoomCard key={room._id} room={room} />
      ))}
    </div>
  );
};
// Add styles
const styles = `
  .rooms-layout {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    width: 100%;
    margin: 0 auto;
    transition: box-shadow 0.3s ease;
  }
  .card:hover {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  }
  .card-header {
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
  }
  .card-content {
    padding: 20px;
  }
  .room-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .room-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
  .badge {
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 500;
  }
  .badge.normal {
    background-color: #E8F0FE;
    color: #1A73E8;
  }
  .badge.critical {
    background-color: #FCE8E6;
    color: #EA4335;
  }
  .room-info {
    display: flex;
    gap: 8px;
    align-items: center;
    color: #666;
    font-size: 14px;
  }
  .room-type {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .activity-icon, .bed-icon {
    width: 16px;
    height: 16px;
  }
  .separator {
    color: #999;
  }
  .beds-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
    margin-top: 16px;
  }
  .bed {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.3s ease;
  }
  .bed:hover {
    transform: scale(1.05);
  }
  .bed.available {
    background-color: #E6F4EA;
    border: 2px solid #34A853;
  }
  .bed.occupied {
    background-color: #FCE8E6;
    border: 2px solid #EA4335;
  }
  .bed-icon {
    width: 32px;
    height: 32px;
  }
  .available .bed-icon {
    color: #34A853;
  }
  .occupied .bed-icon {
    color: #EA4335;
  }
  .bed-tooltip {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%) scale(0);
    background-color: #333;
    color: white;
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    transition: transform 0.2s ease;
    z-index: 1;
  }
  .bed:hover .bed-tooltip {
    transform: translateX(-50%) scale(1);
  }
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }
  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #F3F3F3;
    border-top: 3px solid #333;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  .error-message {
    text-align: center;
    color: #EA4335;
    padding: 16px;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @media (max-width: 768px) {
    .rooms-layout {
      padding: 16px;
    }
    .bed {
      width: 60px;
      height: 60px;
    }
    .bed-icon {
      width: 24px;
      height: 24px;
    }
  }
`;
// Inject styles
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);
export default BedAvailability;
