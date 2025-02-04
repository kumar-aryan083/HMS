import React, { useContext, useEffect, useState } from "react";
import "./styles/IpdConsumablesList.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Consumables from "./Consumables";
import EditConsumablePopup from "./EditConsumablePopup";
import Loader from "../Loader";

const IpdConsumablesList = ({ admissionId }) => {
  const { setNotification } = useContext(AppContext);
  const [isIpdConsumableOpen, setIsIpdConsumableOpen] = useState(false);
  const [assignedMedicines, setAssignedMedicines] = useState([]);
  const [isMedEditPopupOpen, setIsMedEditPopupOpen] = useState(false);
  const [editedMedicine, setEditedMedicine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const toggleConsumablesPopup = () =>
    setIsIpdConsumableOpen(!isIpdConsumableOpen);

  useEffect(() => {
    fetchIpdConsumables();
  }, []);

  const fetchIpdConsumables = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/get-consumables`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setAssignedMedicines(data.consumables);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConsumable = () => {
    fetchIpdConsumables();
  };
  const handleDeleteConsumable = async (medicineId) => {
    // console.log(medicineId);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/delete-consumable/${medicineId}`,
        {
          method: "DELETE",
          headers: {
            "x-tenant-id": environment.tenantId,
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        fetchIpdConsumables();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  const openEditPopup = (medicine) => {
    setEditedMedicine(medicine);
    setIsMedEditPopupOpen(true);
  };

  const closeEditPopup = () => {
    setEditedMedicine(null);
    setIsMedEditPopupOpen(false);
  };

  const handleUpdateMedicine = async (updatedData) => {
    // console.log("Updated medicine data:", updatedData);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/edit-consumable/${updatedData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(updatedData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        
        fetchIpdConsumables();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...assignedMedicines]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(assignedMedicines.length / itemsPerPage);

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
    <div className="pharmacy-list">
      <h2>Assigned Medicines</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button onClick={toggleConsumablesPopup} className="pharmacy-add-btn">
          Assign Medicine
        </button>
      </div>
      <hr className="am-h-line" />

      {loading ? (
        <Loader />
      ) : (
        <div>
          <table className="pharmacy-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine Type</th>
                <th>Medicine Name</th>
                <th>Dosage</th>
                <th>Assigned By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems && currentItems.length > 0 ? (
                currentItems.map((med, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{med.type || "N/A"}</td>
                    <td>{med.name}</td>
                    <td>{med.dosage}</td>
                    <td>{med.doctor}</td>

                    <td className="ipd-consumable-icons">
                      <FontAwesomeIcon
                        icon={faEdit}
                        title="Edit"
                        className="consumable-icon"
                        onClick={() => openEditPopup(med)}
                        style={{fontSize: "15px"}}
                      />
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        title="Delete"
                        className="consumable-icon"
                        onClick={() => handleDeleteConsumable(med._id)}
                        style={{fontSize: "15px"}}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No Tests assigned yet.
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

      {/* Popup rendering */}
      {isIpdConsumableOpen && (
        <div className="pharmacy-popup">
          <div className="pharmacy-popup-content">
            <button
              className="pharmacy-close-popup-btn"
              onClick={toggleConsumablesPopup}
            >
              X
            </button>
            <Consumables
              admissionId={admissionId}
              toggleConsumablesPopup={toggleConsumablesPopup}
              onAssign={handleNewConsumable}
            />
          </div>
        </div>
      )}

      {isMedEditPopupOpen && (
        <EditConsumablePopup
          medicine={editedMedicine}
          onClose={closeEditPopup}
          onUpdate={handleUpdateMedicine}
        />
      )}
    </div>
  );
};

export default IpdConsumablesList;
