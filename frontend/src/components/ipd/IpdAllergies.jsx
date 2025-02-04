import React, { useContext, useEffect, useState } from "react";
import "./styles/IpdAllergies.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Allergies from "./Allergies";
import EditIpdAllergyPopup from "./EditIpdAllergyPopup";
import Loader from "../Loader";

const IpdAllergies = ({ admissionId }) => {
  const { setNotification } = useContext(AppContext);
  const [isIpdAllergiesOpen, setIsIpdAllergiesOpen] = useState(false);
  const [allergies, setAllergies] = useState([]);
  const [isAllergyEditPopupOpen, setIsAllergyEditPopupOpen] = useState(false);
  const [editedAllergy, setEditedAllergy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const toggleAllergyPopup = () => setIsIpdAllergiesOpen(!isIpdAllergiesOpen);

  useEffect(() => {
    fetchIpdAllergies();
  }, []);

  const fetchIpdAllergies = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/get-allergies`,
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
        setAllergies(data.allergies);
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
    fetchIpdAllergies();
  };

  const handleDeleteAllergy = async (allergyId) => {
    // console.log(allergyId);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/delete-allergy/${allergyId}`,
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
        fetchIpdAllergies();
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
        `${environment.url}/api/ipd/${admissionId}/edit-allergy/${updatedData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(updatedData.updatedBody),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        fetchIpdAllergies();
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
  const currentItems = [...allergies]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allergies.length / itemsPerPage);

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
      <h2>Allergies List</h2>
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
        <div>
          <table className="pharmacy-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Allergy Name</th>
                <th>Type</th>
                <th>Notes</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems && currentItems.length > 0 ? (
                currentItems.map((allergy, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{allergy.allergyName}</td>
                    <td>{allergy.allergyType}</td>
                    <td>
                      <div
                        dangerouslySetInnerHTML={{ __html: allergy.notes }}
                      ></div>
                    </td>
                    <td>{allergy.doctorId.name}</td>
                    <td>
                      {new Date(allergy.dateTime).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>

                    <td className="ipd-allergies-icons">
                      <FontAwesomeIcon
                        icon={faEdit}
                        title="Edit"
                        className="allergies-icon"
                        onClick={() => openEditPopup(allergy)}
                        style={{fontSize: "15px"}}
                      />
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        title="Delete"
                        className="allergies-icon"
                        onClick={() => handleDeleteAllergy(allergy._id)}
                        style={{fontSize: "15px"}}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No Allergies to show.
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
      {isIpdAllergiesOpen && (
        <div className="pharmacy-popup">
          <div className="pharmacy-popup-content">
            <button
              className="pharmacy-close-popup-btn"
              onClick={toggleAllergyPopup}
            >
              X
            </button>
            <Allergies
              admissionId={admissionId}
              toggleAllergyPopup={toggleAllergyPopup}
              onAssign={handleNewAllergy}
            />
          </div>
        </div>
      )}

      {isAllergyEditPopupOpen && (
        <EditIpdAllergyPopup
          allergy={editedAllergy}
          onClose={closeEditPopup}
          onUpdate={handleUpdateAllergy}
        />
      )}
    </div>
  );
};

export default IpdAllergies;
