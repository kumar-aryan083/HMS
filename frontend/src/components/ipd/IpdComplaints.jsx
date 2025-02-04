import React, { useContext, useEffect, useState } from "react";
import "./styles/IpdComplaints.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import ChiefComplaints from "./ChiefComplaints";
import EditComplaintPopup from "./EditComplaintPopup";
import Loader from "../Loader";

const IpdComplaints = ({ admissionId }) => {
  const { setNotification } = useContext(AppContext);
  const [isIpdComplaintsOpen, setIsIpdComplaintsOpen] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [isComplaintEditPopupOpen, setIsComplaintEditPopupOpen] =
    useState(false);
  const [editedComplaint, setEditedComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const toggleComplaintsPopup = () =>
    setIsIpdComplaintsOpen(!isIpdComplaintsOpen);

  useEffect(() => {
    fetchIpdComplaints();
  }, []);

  const fetchIpdComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/get-chief-complaints`,
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
        setComplaints(data.complaints);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewComplaint = () => {
    fetchIpdComplaints();
  };

  const handleDeleteComplaint = async (complaintId) => {
    // console.log(complaintId);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/delete-complaint/${complaintId}`,
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
        fetchIpdComplaints();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  const openEditPopup = (complaint) => {
    setEditedComplaint(complaint);
    setIsComplaintEditPopupOpen(true);
  };

  const closeEditPopup = () => {
    setEditedComplaint(null);
    setIsComplaintEditPopupOpen(false);
  };

  const handleUpdateComplaint = async (updatedData) => {
    // console.log("Updated complaint data:", updatedData);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/edit-complaint/${updatedData._id}`,
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
        fetchIpdComplaints();
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
  const currentItems = [...complaints]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(complaints.length / itemsPerPage);

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
      <h2>Complaints List</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button onClick={toggleComplaintsPopup} className="pharmacy-add-btn">
          Add Complaint
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
                <th>Complaint Type</th>
                <th>Description</th>
                <th>Complaint</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems && currentItems.length > 0 ? (
                currentItems.map((complaint, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{complaint.type}</td>
                    <td>{complaint.description}</td>
                    <td>{complaint.complaint}</td>
                    <td>
                      {new Date(complaint.updatedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </td>

                    <td className="ipd-complaints-icons">
                      <FontAwesomeIcon
                        icon={faEdit}
                        title="Edit"
                        className="complaints-icon"
                        onClick={() => openEditPopup(complaint)}
                        style={{fontSize: "15px"}}
                      />
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        title="Delete"
                        className="complaints-icon"
                        onClick={() => handleDeleteComplaint(complaint._id)}
                        style={{fontSize: "15px"}}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No Complaints assigned yet.
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
      {isIpdComplaintsOpen && (
        <div className="pharmacy-popup">
          <div className="pharmacy-popup-content">
            <button
              className="pharmacy-close-popup-btn"
              onClick={toggleComplaintsPopup}
            >
              X
            </button>
            <ChiefComplaints
              admissionId={admissionId}
              toggleComplaintsPopup={toggleComplaintsPopup}
              onAssign={handleNewComplaint}
            />
          </div>
        </div>
      )}

      {isComplaintEditPopupOpen && (
        <EditComplaintPopup
          complaint={editedComplaint}
          onClose={closeEditPopup}
          onUpdate={handleUpdateComplaint}
        />
      )}
    </div>
  );
};

export default IpdComplaints;
