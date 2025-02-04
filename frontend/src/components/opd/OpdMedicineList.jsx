import React, { useContext, useEffect, useState } from "react";
import AssignMedicine from "./AssignMedicine";
import "./styles/OpdMedicationList.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import EditMedicinePopup from "./EditMedicinePopup";
import Loader from "../Loader";

const OpdMedicineList = ({ opdId }) => {
  const { setNotification } = useContext(AppContext);
  const [isOpdMedicineOpen, setIsOpdMedicineOpen] = useState(false);
  const [assignedMedications, setAssignedMedications] = useState([]);
  const [isMedEditPopupOpen, setIsMedEditPopupOpen] = useState(false);
  const [editedMedicine, setEditedMedicine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const togglePopup = () => {
    setIsOpdMedicineOpen(!isOpdMedicineOpen);
  };

  useEffect(() => {
    fetchOpdMedicine();
  }, []);

  const fetchOpdMedicine = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/opd/${opdId}/get-medications`,
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
        setAssignedMedications(data.medications);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMedications = () => {
    fetchOpdMedicine();
  };

  const openEditPopup = (medicine) => {
    setEditedMedicine(medicine);
    setIsMedEditPopupOpen(true);
  };

  const handleDeleteMedicine = async (medicineId) => {
    // console.log(medicineId)
    try {
      const res = await fetch(
        `${environment.url}/api/opd/${opdId}/delete-medications/${medicineId}`,
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
        fetchOpdMedicine();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("Server error");
    }
  };

  const closeEditPopup = () => {
    setEditedMedicine(null);
    setIsMedEditPopupOpen(false);
  };

  const handleUpdateMedicine = async (updatedData) => {
    // console.log("Updated medicine data:", updatedData);
    try {
      const res = await fetch(
        `${environment.url}/api/opd/${opdId}/edit-medication/${updatedData._id}`,
        {
          method: "PUT",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(updatedData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        closeEditPopup();
        fetchOpdMedicine();
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
  const currentItems = [...assignedMedications]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(assignedMedications.length / itemsPerPage);

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
      <h2>Assigned Medications</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button onClick={togglePopup} className="pharmacy-add-btn">
          Add Medication
        </button>
      </div>
      <hr className="am-h-line" />

      {loading ? (
        <Loader />
      ) : (
        <table className="pharmacy-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Medicine Name</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems && currentItems.length > 0 ? (
              currentItems.map((med, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{med.name}</td>
                  <td>{med.dosage}</td>
                  <td>{med.frequency}</td>
                  <td className="opd-medicines-icons">
                    <FontAwesomeIcon
                      icon={faEdit}
                      onClick={() => openEditPopup(med)}
                      title="open"
                      className="all-ipds-icon"
                      style={{fontSize: "20px"}}
                    />
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      onClick={() => handleDeleteMedicine(med._id)}
                      title="open"
                      className="all-ipds-icon"
                      style={{fontSize: "20px"}}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data">
                  No medications assigned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

      {isOpdMedicineOpen && (
        <div className="pharmacy-popup">
          <div className="pharmacy-popup-content">
            <button className="opd-closeBtn" onClick={togglePopup}>
              X
            </button>
            <AssignMedicine
              opdId={opdId}
              togglePopup={togglePopup}
              onAssign={handleNewMedications}
            />
          </div>
        </div>
      )}

      {/* Edit Medicine Popup */}
      {isMedEditPopupOpen && (
        <EditMedicinePopup
          medicine={editedMedicine}
          onClose={closeEditPopup}
          onUpdate={handleUpdateMedicine}
        />
      )}
    </div>
  );
};

export default OpdMedicineList;
