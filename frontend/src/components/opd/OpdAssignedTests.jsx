import React, { useContext, useEffect, useState } from "react";
import AssignTests from "./AssignTests";
import "./styles/OpdAssignedTests.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import EditTestPopup from "./EditTestPopup";
import Loader from "../Loader";

const OpdAssignedTests = ({ opdId }) => {
  const { setNotification } = useContext(AppContext);
  const [isOpdTestOpen, setIsOpdTestOpen] = useState(false);
  const [assignedTests, setAssignedTests] = useState([]);
  const [isTestEditPopupOpen, setIsTestEditPopupOpen] = useState(false);
  const [editedTest, setEditedTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const toggleTestPopup = () => setIsOpdTestOpen(!isOpdTestOpen);

  useEffect(() => {
    fetchOpdTests();
  }, []);

  const fetchOpdTests = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/opd/${opdId}/get-assigned-tests`,
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
        setAssignedTests(data.assignedTests);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTest = () => {
    fetchOpdTests();
  };

  const handleDeleteTest = async (testId) => {
    // console.log(testId)
    try {
      const res = await fetch(
        `${environment.url}/api/opd/${opdId}/delete-assigned-tests/${testId}`,
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
        fetchOpdTests();
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  const openEditPopup = (test) => {
    setEditedTest(test);
    setIsTestEditPopupOpen(true);
  };

  const closeEditPopup = () => {
    setEditedTest(null);
    setIsTestEditPopupOpen(false);
  };

  const handleUpdateTest = async (updatedData) => {
    // console.log("Updated test data:", updatedData);
    try {
      const res = await fetch(
        `${environment.url}/api/opd/${opdId}/edit-test/${updatedData._id}`,
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
        fetchOpdTests();
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
  const currentItems = [...assignedTests]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(assignedTests.length / itemsPerPage);

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
      <h2>Assigned Tests</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button onClick={toggleTestPopup} className="pharmacy-add-btn">
          Assign Tests
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
              <th>Code</th>
              <th>Test Name</th>
              <th>Status</th>
              <th>Assigned Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems && currentItems.length > 0 ? (
              currentItems.map((test, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{test.testId.code || "N/A"}</td>
                  <td>{test.testId.name}</td>
                  <td>{test.status}</td>
                  <td>
                    {new Date(test.assignedDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>

                  <td className="opd-tests-icons">
                    <FontAwesomeIcon
                      icon={faEdit}
                      title="Edit"
                      className="tests-icon"
                      onClick={() => openEditPopup(test)}
                      style={{fontSize: "20px"}}
                    />
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      title="Delete"
                      className="tests-icon"
                      onClick={() => handleDeleteTest(test._id)}
                      style={{fontSize: "20px"}}
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
      {isOpdTestOpen && (
        <div className="pharmacy-popup">
          <div className="pharmacy-popup-content">
            <button className="pharmacy-close-popup-btn" onClick={toggleTestPopup}>
              X
            </button>
            <AssignTests
              opdId={opdId}
              toggleTestPopup={toggleTestPopup}
              onAssign={handleNewTest}
            />
          </div>
        </div>
      )}

      {isTestEditPopupOpen && (
        <EditTestPopup
          test={editedTest}
          onClose={closeEditPopup}
          onUpdate={handleUpdateTest}
        />
      )}
    </div>
  );
};

export default OpdAssignedTests;
