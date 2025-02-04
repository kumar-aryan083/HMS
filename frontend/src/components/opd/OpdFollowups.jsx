import React, { useContext, useEffect, useState } from "react";
import "./styles/OpdFollowups.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Followup from "./Followup";
import EditFollowupPopup from "./EditFollowupPopup";
import Loader from "../Loader";

const OpdFollowups = ({ opdId }) => {
  const { setNotification } = useContext(AppContext);
  const [isOpdFollowupOpen, setIsOpdFollowupOpen] = useState(false);
  const [followups, setFollowups] = useState([]);
  const [isFollowupEditPopupOpen, setIsFollowupEditPopupOpen] = useState(false);
  const [editedFollowup, setEditedFollowup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const toggleFollowupPopup = () => setIsOpdFollowupOpen(!isOpdFollowupOpen);

  useEffect(() => {
    fetchFollowups();
  }, []);

  const fetchFollowups = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/opd/${opdId}/get-followup-history`,
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
        setFollowups(data.followUpHistory);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewFollowup = () => {
    fetchFollowups();
  };

  const handleDeleteFollowup = async (followupId) => {
    // console.log(followupId);
    try {
      const res = await fetch(
        `${environment.url}/api/opd/${opdId}/delete-followup/${followupId}`,
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
        fetchFollowups();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  const openEditPopup = (followup) => {
    setEditedFollowup(followup);
    setIsFollowupEditPopupOpen(true);
  };

  const closeEditPopup = () => {
    setEditedFollowup(null);
    setIsFollowupEditPopupOpen(false);
  };

  const handleUpdateFollowup = async (updatedData) => {
    // console.log("Updated followup data:", updatedData);
    try {
      const res = await fetch(
        `${environment.url}/api/opd/${opdId}/edit-followup/${updatedData._id}`,
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
        fetchFollowups();
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
  const currentItems = [...followups]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(followups.length / itemsPerPage);

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
      <h2>Followup History</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button onClick={toggleFollowupPopup} className="pharmacy-add-btn">
          Add Follow up
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
              <th>Follow up Date</th>
              <th>Notes</th>
              <th>Assigned By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems && currentItems.length > 0 ? (
              currentItems.map((followup, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    {new Date(followup.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td>
                    <div
                      dangerouslySetInnerHTML={{ __html: followup.notes }}
                    ></div>
                  </td>
                  <td>{followup.assignedBy.name}</td>

                  <td className="opd-followup-icons">
                    <FontAwesomeIcon
                      icon={faEdit}
                      title="Edit"
                      className="followup-icon"
                      onClick={() => openEditPopup(followup)}
                      style={{fontSize: "20px"}}
                    />
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      title="Delete"
                      className="followup-icon"
                      onClick={() => handleDeleteFollowup(followup._id)}
                      style={{fontSize: "20px"}}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  No Followups added yet.
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
      {isOpdFollowupOpen && (
        <div className="pharmacy-popup">
          <div className="pharmacy-popup-content">
            <button
              className="opd-closeBtn"
              onClick={toggleFollowupPopup}
            >
              X
            </button>
            <Followup
              opdId={opdId}
              toggleFollowupPopup={toggleFollowupPopup}
              onAssign={handleNewFollowup}
            />
          </div>
        </div>
      )}

      {isFollowupEditPopupOpen && (
        <EditFollowupPopup
          followup={editedFollowup}
          onClose={closeEditPopup}
          onUpdate={handleUpdateFollowup}
        />
      )}
    </div>
  );
};

export default OpdFollowups;
