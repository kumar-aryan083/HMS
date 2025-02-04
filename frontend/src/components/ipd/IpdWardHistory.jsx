import React, { useContext, useEffect, useState } from "react";
import "./styles/IpdWardHistory.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import ChangeWardHistory from "./ChangeWardHistory";
import Loader from "../Loader";

const IpdWardHistory = ({ admissionId }) => {
  const { setNotification } = useContext(AppContext);
  const [isIpdWardHistoryOpen, setIsIpdWardHistoryOpen] = useState(false);
  const [wardHistory, setWardHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const toggleWardHistoryPopup = () =>
    setIsIpdWardHistoryOpen(!isIpdWardHistoryOpen);

  useEffect(() => {
    fetchWardHistory();
  }, []);

  const fetchWardHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/get-ward-history`,
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
        setWardHistory(data.wardHistoryData);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeWard = () => {
    fetchWardHistory();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...wardHistory]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(wardHistory.length / itemsPerPage);

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
      <h2>Ward History</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button onClick={toggleWardHistoryPopup} className="pharmacy-add-btn">
          Change Ward
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
                <th>Ward Name</th>
                <th>Room Name</th>
                <th>Bed Number</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {currentItems && currentItems.length > 0 ? (
                currentItems.map((ward, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{ward.wingName}</td>
                    <td>{ward.roomNumber}</td>
                    <td>{ward.bedName}</td>
                    <td>
                      {new Date(ward.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No Data to show.
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
      {isIpdWardHistoryOpen && (
        <div className="pharmacy-popup">
          <div className="pharmacy-popup-content">
            <button
              className="pharmacy-close-popup-btn"
              onClick={toggleWardHistoryPopup}
            >
              X
            </button>
            <ChangeWardHistory
              admissionId={admissionId}
              toggleWardHistoryPopup={toggleWardHistoryPopup}
              onAssign={handleChangeWard}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IpdWardHistory;
