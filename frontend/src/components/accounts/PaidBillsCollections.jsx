import React, { useContext, useEffect, useRef, useState } from "react";
import "../storeItem/styles/StoreItemList.css";
import "./styles/IpdOpdCollections.css";
import Loader from "../Loader";
import { AppContext } from "../../context/AppContext";
import { environment } from "../../../utlis/environment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

const PaidBillsCollections = () => {
  const { setNotification, user } = useContext(AppContext);
  const [paidBills, setPaidBills] = useState([]);
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("bill");
  const [patientData, setPatientData] = useState([]);
  const [totalPatientWise, setTotalPatientWise] = useState(null);
  const [selectedPatientBills, setSelectedPatientBills] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [total, setTotal] = useState(null);
  const [filter, setFilter] = useState(""); 
  const [filteredBills, setFilteredBills] = useState(paidBills);
  const [filteredPatients, setFilteredPatients] = useState(patientData);
  const [filteredBillsTotal, setFilteredBillsTotal] = useState(stats?.finalPrice || 0); 
const [filteredPatientsTotal, setFilteredPatientsTotal] = useState(totalPatientWise || 0);

  useEffect(() => {
    fetchData();
  }, [mode]);

  useEffect(() => {
    if (mode === "bill") {
      const total = filteredBills.reduce(
        (sum, bill) => sum + (bill.grandTotals?.finalPrice || 0),
        0
      );
      setFilteredBillsTotal(total);
    } else {
      const total = filteredPatients.reduce(
        (sum, patient) => sum + (patient.totalPaid || 0),
        0
      );
      setFilteredPatientsTotal(total);
    }
  }, [filteredBills, filteredPatients]);

  const fetchData = async () => {
    if (mode === "bill") {
      fetchPaidBills();
    } else {
      fetchPatientWiseData();
    }
  };

  const fetchPaidBills = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/account/get-paid-bills-account?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log("all paid bills", data);
        setPaidBills(data.data);
        setFilteredBills(data.data);
        setStats(data.stats);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
    }
    setLoading(false);
  };

  const fetchPatientWiseData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/account/get-patient-wise-paid-bills?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setPatientData(data.data);
        setFilteredPatients(data.data);
        setTotalPatientWise(data.overallStats?.totalPaid);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBills = (bills, totalPaid) => {
    setSelectedPatientBills(bills);
    setTotal(totalPaid);
    setShowModal(true);
  };

  const applyFilter = () => {
    if (!filter.trim()) {
      // Reset to full data if the filter is empty
      setFilteredBills(paidBills);
      setFilteredPatients(patientData);
    } else if (mode === "bill") {
      const filtered = paidBills.filter((bill) =>
        bill.billNumber.toString().includes(filter)
      );
      setFilteredBills(filtered);
    } else if (mode === "patient") {
      const filtered = patientData.filter((patient) =>
        patient.patientName.toLowerCase().includes(filter.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  };

  function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);

    if (isNaN(date)) {
      throw new Error("Invalid date");
    }

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }

  return (
    <div className="accounts-list">
      {/* <h2>Paid Bills Collections</h2> */}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="accounts-date">
          <div className="date-filters">
            <label>
              Start Date:
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label style={{ marginLeft: "20px" }}>
              End Date:
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
            <button className="statistics-search" onClick={() => fetchData()}>
              Show
            </button>
          </div>
        </div>
        <div style={{ marginTop: "20px", display: "flex", gap: "20px" }}>
          <input
            type="text"
            placeholder={
              mode === "bill"
                ? "Filter by Bill Number"
                : "Filter by Patient Name"
            }
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: "fit-content",
              height: "fit-content",
              margin: "auto 0", }}
          />
          <button
            onClick={applyFilter}
            style={{ width: "fit-content",
              height: "fit-content",
              margin: "auto 0", }}
          >
            Apply Filter
          </button>
        </div>
        <div className="accounts-tabs">
          <button
            onClick={() => setMode("bill")}
            className={`single-tab ${mode === "bill" ? "active" : ""}`}
            style={{
              width: "fit-content",
              height: "fit-content",
              margin: "auto 0",
            }}
          >
            Bill Wise
          </button>
          <button
            onClick={() => setMode("patient")}
            className={`single-tab ${mode === "patient" ? "active" : ""}`}
            style={{
              width: "fit-content",
              height: "fit-content",
              margin: "auto 0",
            }}
          >
            Patient Wise
          </button>
        </div>
      </div>
      <hr className="am-h-line" />

      {loading ? (
        <Loader />
      ) : mode === "bill" ? (
        <table className="accounts-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Bill Number</th>
              <th>Type</th>
              <th>Date</th>
              <th>Total Items</th>
              <th>Final Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills && filteredBills.length > 0 ? (
              <>
                {filteredBills.map((bill, index) => (
                  <tr key={bill._id}>
                    <td>{index + 1}</td>
                    <td>{bill.billNumber}</td>
                    <td>{bill.type}</td>
                    <td>{formatDateToDDMMYYYY(bill.date)}</td>
                    <td>{bill.item?.length || 0}</td>
                    <td>{bill.grandTotals?.finalPrice || 0}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td
                    colSpan="5"
                    style={{ textAlign: "right", fontWeight: "bold" }}
                  >
                    Total Due:
                  </td>
                  <td colSpan="2" style={{ fontWeight: "bold" }}>
                    {filteredBillsTotal.toFixed(2)}
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No Paid Collections to show yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <table className="accounts-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Patient Name</th>
              <th>UHID</th>
              <th>Payment Type</th>
              <th>Total Paid</th>
              <th>View Bills</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients && filteredPatients.length > 0 ? (
              <>
                {filteredPatients.map((patient, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{patient.patientName}</td>
                    <td>{patient.uhid}</td>
                    <td>{patient.patientPaymentType}</td>
                    <td>{patient.totalPaid.toFixed(2)}</td>
                    <td style={{ width: "100px", textAlign: "center" }}>
                      <FontAwesomeIcon
                        icon={faEye}
                        title="open"
                        className="all-ipds-icon"
                        onClick={() =>
                          handleViewBills(patient.bills, patient.totalPaid)
                        }
                      />
                    </td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td
                    colSpan="4"
                    style={{ textAlign: "right", fontWeight: "bold" }}
                  >
                    Total Due:
                  </td>
                  <td colSpan="2" style={{ fontWeight: "bold" }}>
                    {filteredPatientsTotal.toFixed(2)}
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan="5">No Patient-Wise Collections to show yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className={`account-view-modal ${showModal ? "visible" : ""}`}>
          <div className="account-view-modal-content">
            <span
              className="account-view-close"
              onClick={() => setShowModal(false)}
            >
              X
            </span>
            <h2>Patient Bill Details</h2>
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>Bill Number</th>
                  <th>Bill Type</th>
                  <th>Date</th>
                  <th>Total Items</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedPatientBills.map((bill, index) => (
                  <tr key={bill.billNumber}>
                    <td>{bill.billNumber}</td>
                    <td>{bill.billType}</td>
                    <td>{formatDateToDDMMYYYY(bill.date)}</td>
                    <td>{bill.totalItems}</td>
                    <td>{bill.billFinalPrice}</td>
                  </tr>
                ))}
                {selectedPatientBills.length > 0 && (
                  <tr className="total-row">
                    <td
                      colSpan="4"
                      style={{ textAlign: "right", fontWeight: "bold" }}
                    >
                      Total:
                    </td>
                    <td colSpan="2" style={{ fontWeight: "bold" }}>
                      {filteredBillsTotal.toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaidBillsCollections;
