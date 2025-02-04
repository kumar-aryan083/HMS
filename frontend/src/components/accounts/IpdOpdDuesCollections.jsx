import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { environment } from "../../../utlis/environment";
import Loader from "../Loader";

const IpdOpdDuesCollections = () => {
  const { setNotification, user } = useContext(AppContext);
  const [mode, setMode] = useState("bill");
  const [patientData, setPatientData] = useState([]);
  const [dues, setDues] = useState([]);
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [totalBillWiseDues, setTotalBillWiseDues] = useState(null);
  const [totalPatientWiseDues, setTotalPatientWiseDues] = useState(null);
  const [filter, setFilter] = useState("");
  const [filteredBills, setFilteredBills] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [totalBillWise, setTotalBillWise] = useState(0);
  const [totalPatientWise, setTotalPatientWise] = useState(0);

  useEffect(() => {
    fetchData();
  }, [mode]);

  useEffect(() => {
    if (mode === "bill") {
      const total = filteredBills.reduce(
        (sum, item) => sum + (item.due || 0),
        0
      );
      setTotalBillWise(total);
    } else {
      const total = filteredPatients.reduce(
        (sum, item) => sum + (item.totalDue || 0),
        0
      );
      setTotalPatientWise(total);
    }
  }, [filteredBills, filteredPatients]);

  const fetchData = async () => {
    if (mode === "bill") {
      fetchDues();
    } else {
      fetchPatientWiseData();
    }
  };

  const fetchDues = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/account/get-bill-wise-due?startDate=${startDate}&endDate=${endDate}`,
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
        // console.log("All Dues", data);
        setDues(data.items);
        setFilteredBills(data.items);(data.items);
        setTotalBillWiseDues(data.totalDue);
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
        `${environment.url}/api/account/get-account-dues?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setPatientData(data.dueStats);
        setFilteredPatients(data.dueStats);
        setTotalPatientWiseDues(data.totalDue);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilter = () => {
    if (filter.trim() === "") {
      setFilteredBills(dues);
      setFilteredPatients(patientData);
    } else if (mode === "bill") {
      const filtered = dues.filter((item) =>
        item.billNumber.toString().includes(filter)
      );
      setFilteredBills(filtered);
    } else {
      const filtered = patientData.filter((item) =>
        item.name.toLowerCase().includes(filter.toLowerCase())
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
      {/* <h2>Dues Collections</h2> */}
      <div style={{display: "flex", justifyContent: "space-between"}}>
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
            style={{width:"fit-content", height: "fit-content", margin: "auto 0"}}
          >
            Bill Wise
          </button>
          <button
            onClick={() => setMode("patient")}
            className={`single-tab ${mode === "patient" ? "active" : ""}`}
            style={{width:"fit-content", height: "fit-content", margin: "auto 0"}}
          >
            Patient Wise
          </button>
        </div>
      </div>

      <hr className="am-h-line" />

      {loading ? (
        <Loader />
      ) : (
        <>
          {mode === "bill" && (
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Bill Number</th>
                  <th>Bill Type</th>
                  <th>Date</th>
                  <th>Patient Name</th>
                  <th>UHID</th>
                  <th>Patient Payment Type</th>
                  <th>Due Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills && filteredBills.length > 0 ? (
                  <>
                    {filteredBills.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.billNumber}</td>
                        <td>{item.billType}</td>
                        <td>{formatDateToDDMMYYYY(item.date)}</td>
                        <td>{item.patientName}</td>
                        <td>{item.uhid}</td>
                        <td>{item.patientPaymentType}</td>
                        <td>{item.due.toFixed(2)}</td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="total-row">
                      <td
                        colSpan="7"
                        style={{ textAlign: "right", fontWeight: "bold" }}
                      >
                        Total Due:
                      </td>
                      <td colSpan="2" style={{ fontWeight: "bold" }}>
                        {totalBillWise.toFixed(2)}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      No Bill-Wise Dues to show yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {mode === "patient" && (
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient Name</th>
                  <th>Patient UHID</th>
                  <th>Patient Payment Type</th>
                  <th>Total Due</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients && filteredPatients.length > 0 ? (
                  <>
                    {filteredPatients.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.uhid}</td>
                        <td>{item.paymentType}</td>
                        <td>{item.totalDue.toFixed(2)}</td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="total-row">
                      <td
                        colSpan="4"
                        style={{ textAlign: "right", fontWeight: "bold" }}
                      >
                        Total Due:
                      </td>
                      <td style={{ fontWeight: "bold" }}>
                        {totalPatientWise.toFixed(2)}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No Patient-Wise Dues to show yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default IpdOpdDuesCollections;
