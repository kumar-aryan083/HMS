import React, { useContext, useEffect, useState } from "react";
import "./styles/IpdAllergies.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import VisitNotes from "./VisitNotes";
import EditVisitNotePopup from "./EditVisitNotePopup";
import Loader from "../Loader";

const IpdAllergies = ({ admissionId }) => {
  const { setNotification } = useContext(AppContext);
  const [isIpdVisitOpen, setIsIpdVisitOpen] = useState(false);
  const [visitNotes, setVisitNotes] = useState([]);
  const [isNoteEditPopupOpen, setIsNoteEditPopupOpen] = useState(false);
  const [editedNote, setEditedNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const toggleVisitPopup = () => setIsIpdVisitOpen(!isIpdVisitOpen);

  useEffect(() => {
    fetchIpdVisitNotes();
  }, []);

  const fetchIpdVisitNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/get-visit-notes`,
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
        setVisitNotes(data.visitNotes);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewVisitNote = () => {
    fetchIpdVisitNotes();
  };

  const handleDeleteNote = async (noteId) => {
    // console.log(noteId);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/delete-visit-note/${noteId}`,
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
        fetchIpdVisitNotes();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  const openEditPopup = (note) => {
    setEditedNote(note);
    setIsNoteEditPopupOpen(true);
  };

  const closeEditPopup = () => {
    setEditedNote(null);
    setIsNoteEditPopupOpen(false);
  };

  const handleUpdateNote = async (updatedData) => {
    // console.log("Updated visit note data:", updatedData);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/edit-visit-note/${updatedData._id}`,
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
        fetchIpdVisitNotes();
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
  const currentItems = [...visitNotes]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(visitNotes.length / itemsPerPage);

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
      <h2>Visit Notes List</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button onClick={toggleVisitPopup} className="pharmacy-add-btn">
          Add Visit Note
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
                <th>Doctor name</th>
                <th>Notes</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems && currentItems.length > 0 ? (
                currentItems.map((note, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{note.doctorId.name}</td>
                    <td>
                      <div
                        dangerouslySetInnerHTML={{ __html: note.note }}
                      ></div>
                    </td>
                    <td>
                      {new Date(note.dateTime).toLocaleDateString("en-US", {
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
                        onClick={() => openEditPopup(note)}
                        style={{fontSize: "15px"}}
                      />
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        title="Delete"
                        className="allergies-icon"
                        onClick={() => handleDeleteNote(note._id)}
                        style={{fontSize: "15px"}}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No Visit Notes to show.
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
      {isIpdVisitOpen && (
        <div className="pharmacy-popup">
          <div className="pharmacy-popup-content">
            <button
              className="pharmacy-close-popup-btn"
              onClick={toggleVisitPopup}
            >
              X
            </button>
            <VisitNotes
              admissionId={admissionId}
              toggleVisitPopup={toggleVisitPopup}
              onAssign={handleNewVisitNote}
            />
          </div>
        </div>
      )}

      {isNoteEditPopupOpen && (
        <EditVisitNotePopup
          note={editedNote}
          onClose={closeEditPopup}
          onUpdate={handleUpdateNote}
        />
      )}
    </div>
  );
};

export default IpdAllergies;
