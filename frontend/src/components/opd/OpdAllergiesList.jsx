import React, { useContext, useEffect, useState } from "react";
import AddAllergy from "./AddAllergy";
import "./styles/OpdAllergiesList.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import EditAllergyPopup from "./EditAllergyPopup";
import Loader from "../Loader";

const OpdAllergiesList = ({ opdId }) => {
  const { setNotification } = useContext(AppContext);
  const [isOpdAllergyOpen, setIsOpdAllergyOpen] = useState(false);
  const [assignedAllergies, setAssignedAllergies] = useState([]);
  const [isAllergyEditPopupOpen, setIsAllergyEditPopupOpen] = useState(false);
  const [editedAllergy, setEditedAllergy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const toggleAllergyPopup = () => setIsOpdAllergyOpen(!isOpdAllergyOpen);

  useEffect(() => {
    fetchOpdAllergies();
  }, []);

  const fetchOpdAllergies = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/opd/${opdId}/get-allergies`,
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
        setAssignedAllergies(data.allergies);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewAllergy = () => {
    fetchOpdAllergies();
  };

  const handleDeleteAllergy = async (allergyId) => {
    // console.log(allergyId);
    try {
      const res = await fetch(
        `${environment.url}/api/opd/${opdId}/delete-allergies/${allergyId}`,
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
        fetchOpdAllergies();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  const openEditPopup = (allergy) => {
    setEditedAllergy(allergy);
    setIsAllergyEditPopupOpen(true);
  };

  const closeEditPopup = () => {
    setEditedAllergy(null);
    setIsAllergyEditPopupOpen(false);
  };

  const handleUpdateAllergy = async (updatedData) => {
    // console.log("Updated allergy data:", updatedData);
    try {
      const res = await fetch(
        `${environment.url}/api/opd/${opdId}/edit-allergy/${updatedData._id}`,
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
        fetchOpdAllergies();
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
  const currentItems = [...assignedAllergies]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(assignedAllergies.length / itemsPerPage);

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
      <h2>Assigned Allergies</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button onClick={toggleAllergyPopup} className="pharmacy-add-btn">
          Add Allergy
        </button>
      </div>
      <hr className="am-h-line" />

      {loading ? (
        <Loader />
      ) : (
        <table className="allergies-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Allergy Name</th>
              <th>Severity</th>
              <th>Notes</th>
              <th>Date Reported</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems && currentItems.length > 0 ? (
              currentItems.map((allergy, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{allergy.name}</td>
                  <td>{allergy.severity}</td>
                  <td>
                    <div
                      dangerouslySetInnerHTML={{ __html: allergy.notes }}
                    ></div>
                  </td>
                  <td>
                    {new Date(allergy.dateReported).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </td>

                  <td className="opd-allergies-icons">
                    <FontAwesomeIcon
                      icon={faEdit}
                      title="Edit"
                      className="allergy-icon"
                      onClick={() => openEditPopup(allergy)}
                      style={{fontSize: "20px"}}
                    />
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      title="Delete"
                      className="allergy-icon"
                      onClick={() => handleDeleteAllergy(allergy._id)}
                      style={{fontSize: "20px"}}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No allergies assigned yet.
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

      {/* Popup rendering */}
      {isOpdAllergyOpen && (
        <div className="pharmacy-popup">
          <div className="pharmacy-popup-content">
            <button
              className="opd-closeBtn"
              onClick={toggleAllergyPopup}
            >
              X
            </button>
            <AddAllergy
              opdId={opdId}
              toggleAllergyPopup={toggleAllergyPopup}
              onAssign={handleNewAllergy}
            />
          </div>
        </div>
      )}

      {isAllergyEditPopupOpen && (
        <EditAllergyPopup
          allergy={editedAllergy}
          onClose={closeEditPopup}
          onUpdate={handleUpdateAllergy}
        />
      )}
    </div>
  );
};

export default OpdAllergiesList;
