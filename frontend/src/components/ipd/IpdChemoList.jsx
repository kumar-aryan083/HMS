import React, { useContext, useEffect, useState } from "react";
import "./styles/IpdChemoList.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import ChemoNotes from "./ChemoNotes";
import EditChemoPopup from "./EditChemoPopup";
import Loader from "../Loader";

const IpdChemoList = ({ admissionId }) => {
  const { setNotification } = useContext(AppContext);
  const [isIpdChemoOpen, setIsIpdChemoOpen] = useState(false);
  const [chemoNotes, setChemoNotes] = useState([]);
  const [isChemoEditPopupOpen, setIsChemoEditPopupOpen] = useState(false);
  const [editedChemo, setEditedChemo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const toggleChemoPopup = () => setIsIpdChemoOpen(!isIpdChemoOpen);

  useEffect(() => {
    fetchIpdChemoNotes();
  }, []);

  const fetchIpdChemoNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/get-chemo-notes`,
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
        setChemoNotes(data.chemoNotes);
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
    fetchIpdChemoNotes();
  };

  const handleDeleteChemo = async (chemoId) => {
    // console.log(chemoId);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/delete-chemo/${chemoId}`,
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
        fetchIpdChemoNotes();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };
  const openEditPopup = (note) => {
    setEditedChemo(note);
    setIsChemoEditPopupOpen(true);
  };

  const closeEditPopup = () => {
    setEditedChemo(null);
    setIsChemoEditPopupOpen(false);
  };

  const handleUpdateChemo = async (updatedData) => {
    // console.log("Updated chemo data:", updatedData);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/edit-chemo/${updatedData._id}`,
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
        fetchIpdChemoNotes();
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
  const currentItems = [...chemoNotes]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(chemoNotes.length / itemsPerPage);

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
      <h2>Chemo Note List</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button onClick={toggleChemoPopup} className="pharmacy-add-btn">
          Add Chemo Note
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
                <th>Plan</th>
                <th>BSA</th>
                <th>Cycle</th>
                <th>Diagnosis</th>
                <th>Height</th>
                <th>Weight</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems && currentItems.length > 0 ? (
                currentItems.map((note, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{note.plan}</td>
                    <td>{note.BSA}</td>
                    <td>{note.cycle}</td>
                    <td>{note.diagnosis}</td>
                    <td>{note.height}</td>
                    <td>{note.weight}</td>
                    <td>
                      {new Date(note.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>

                    <td className="ipd-chemo-icons">
                      <FontAwesomeIcon
                        icon={faEdit}
                        title="Edit"
                        className="chemo-icon"
                        onClick={() => openEditPopup(note)}
                        style={{fontSize: "15px"}}
                      />
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        title="Delete"
                        className="chemo-icon"
                        onClick={() => handleDeleteChemo(note._id)}
                        style={{fontSize: "15px"}}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    No Chemo Notes assigned yet.
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
      {isIpdChemoOpen && (
        <div className="pharmacy-popup">
          <div className="pharmacy-popup-content">
            <button
              className="pharmacy-close-popup-btn"
              onClick={toggleChemoPopup}
            >
              X
            </button>
            <ChemoNotes
              admissionId={admissionId}
              toggleChemoPopup={toggleChemoPopup}
              onAssign={handleNewComplaint}
            />
          </div>
        </div>
      )}

      {isChemoEditPopupOpen && (
        <EditChemoPopup
          chemo={editedChemo}
          onClose={closeEditPopup}
          onUpdate={handleUpdateChemo}
        />
      )}
    </div>
  );
};

export default IpdChemoList;
