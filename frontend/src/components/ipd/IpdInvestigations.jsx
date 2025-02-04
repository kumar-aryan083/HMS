import React, { useContext, useEffect, useState } from "react";
import "./styles/IpdInvestigations.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Investigations from "./Invesitgations";
import EditInvestigationPopup from "./EditInvestigationPopup";
import Loader from "../Loader";

const IpdInvestigations = ({ admissionId }) => {
  const { setNotification } = useContext(AppContext);
  const [isIpdInvestigationOpen, setIsIpdInvestigationOpen] = useState(false);
  const [labTests, setLabTests] = useState([]);
  const [isInvestigationEditPopupOpen, setIsInvestigationEditPopupOpen] =
    useState(false);
  const [editedInvestigation, setEditedInvestigation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const toggleInvestigationPopup = () =>
    setIsIpdInvestigationOpen(!isIpdInvestigationOpen);

  useEffect(() => {
    fetchIpdInvestigations();
  }, []);

  const fetchIpdInvestigations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/ipd/get-ipd-lab-tests`, {
        method: "GET",
        headers: {
          "x-tenant-id": environment.tenantId,
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setLabTests(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewComplaint = () => {
    fetchIpdInvestigations();
  };

  const handleDeleteInvestigation = async (testId) => {
    // console.log(testId);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/delete-ipd-lab-tests/${testId}`,
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
        fetchIpdInvestigations();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  const openEditPopup = (investigation) => {
    setEditedInvestigation(investigation);
    setIsInvestigationEditPopupOpen(true);
  };

  const closeEditPopup = () => {
    setEditedInvestigation(null);
    setIsInvestigationEditPopupOpen(false);
  };

  const handleUpdateInvestigation = async (updatedData) => {
    // console.log("Updated investigation data:", updatedData);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/edit-ipd-lab-tests/${updatedData._id}`,
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
        fetchIpdInvestigations();
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
  const currentItems = [...labTests]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(labTests.length / itemsPerPage);

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
      <h2>Investigation Lab Tests List</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button
          onClick={toggleInvestigationPopup}
          className="pharmacy-add-btn"
        >
          Add Investigations
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
                <th>Name</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems && currentItems.length > 0 ? (
                currentItems.map((test, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{test.name}</td>
                    <td>{test.status}</td>
                    <td>
                      {new Date(test.dateTime).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true, // For AM/PM format
                      })}
                    </td>

                    <td className="ipd-investigations-icons">
                      <FontAwesomeIcon
                        icon={faEdit}
                        title="Edit"
                        className="investigations-icon"
                        onClick={() => openEditPopup(test)}
                        style={{fontSize: "15px"}}
                      />
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        title="Delete"
                        className="investigations-icon"
                        onClick={() => handleDeleteInvestigation(test._id)}
                        style={{fontSize: "15px"}}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No Lab tests to show yet.
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

      {isIpdInvestigationOpen && (
        <div className="pharmacy-popup">
          <div className="pharmacy-popup-content">
            <button
              className="pharmacy-close-popup-btn"
              onClick={toggleInvestigationPopup}
            >
              X
            </button>
            <Investigations
              admissionId={admissionId}
              toggleInvestigationPopup={toggleInvestigationPopup}
              onAssign={handleNewComplaint}
            />
          </div>
        </div>
      )}

      {isInvestigationEditPopupOpen && (
        <EditInvestigationPopup
          investigation={editedInvestigation}
          onClose={closeEditPopup}
          onUpdate={handleUpdateInvestigation}
        />
      )}
    </div>
  );
};

export default IpdInvestigations;
