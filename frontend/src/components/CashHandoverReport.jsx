import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../context/AppContext";
import { environment } from "../../utlis/environment";
import { useReactToPrint } from "react-to-print";
import hospitalImage from "../assets/hospital.jpg";
import { useNavigate } from "react-router-dom";
import prakashLogo from "../assets/prakashLogo.jpg";

const CashHandoverReport = () => {
  const { user, setNotification } = useContext(AppContext);
  const nav = useNavigate();
  const [date, setDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [staffList, setStaffList] = useState([]); // Store all staff names
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState([]);
  const [userRole, setUserRole] = useState([]);
  const [loading, setLoading] = useState(false);
  const [denominations, setDenominations] = useState([
    { value: 2000, count: 0 },
    { value: 500, count: 0 },
    { value: 200, count: 0 },
    { value: 100, count: 0 },
    { value: 50, count: 0 },
    // { value: 20, count: 0 },
    // { value: 10, count: 0 },
    // { value: 5, count: 0 },
    // { value: 2, count: 0 },
    // { value: 1, count: 0 },
  ]);

  useEffect(() => {
    document.title = "Staff List | HMS";
    if (!user || user.role !== "admin") {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const documentRef = useRef();

  const printBill = useReactToPrint({
    contentRef: documentRef,
  });

  const handleDenominationChange = (index, count) => {
    const newDenominations = [...denominations];
    newDenominations[index].count = parseInt(count) || 0;
    setDenominations(newDenominations);
  };

  const calculateDenominationTotal = () => {
    return denominations.reduce(
      (total, denom) => total + denom.value * denom.count,
      0
    );
  };

  const aggregatePatientData = (ipdCollection) => {
    const aggregated = ipdCollection.reduce((acc, item) => {
      const { patientName, paymentType, amount } = item;

      if (!acc[patientName]) {
        acc[patientName] = { patientName, cash: 0, online: 0, total: 0 };
      }

      if (paymentType.toLowerCase() === "cash") {
        acc[patientName].cash += parseFloat(amount) || 0;
      } else {
        acc[patientName].online += parseFloat(amount) || 0;
      }
      acc[patientName].total += parseFloat(amount) || 0;

      return acc;
    }, {});

    return Object.values(aggregated);
  };

  const aggregateExpenseData = (expenses) => {
    const aggregated = expenses.reduce((acc, item) => {
      const { particular, paymentMode, amount } = item;

      if (!acc[particular]) {
        acc[particular] = { particular, cash: 0, online: 0, total: 0 };
      }

      if (paymentMode.toLowerCase() === "cash") {
        acc[particular].cash += parseFloat(amount) || 0;
      } else {
        acc[particular].online += parseFloat(amount) || 0;
      }
      acc[particular].total += parseFloat(amount) || 0;

      return acc;
    }, {});

    return Object.values(aggregated);
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/common/get-staff-list`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      ); // Assume there's an API to fetch staff
      const data = await response.json();
      // console.log(data);
      setStaffList(data.totalItems); // Save the staff list to state
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };
  const handleStaffChange = (e) => {
    const input = e.target.value;
    setUserName(input); // Update the input value so it appears while typing

    // Filter staff when user types more than 2 characters
    if (input.length > 2) {
      const filtered = staffList.filter((staffMember) =>
        staffMember.name.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredStaff(filtered);
    } else {
      setFilteredStaff([]); // Clear suggestions when input length is less than 3
    }
  };

  // Handle staff selection from the suggestions
  const handleStaffSelect = (selectedStaff) => {
    setUserName(selectedStaff.name);
    setUserEmail(selectedStaff.email);
    setUserRole(selectedStaff.role);
    // setStaff(selectedStaff); // Set selected staff name in input
    // setForm({
    //   ...form,
    //   staffId: selectedStaff._id, // Add staffId to the form state
    //   staffRole: selectedStaff.role, // Add staffRole to the form state
    // });
    setFilteredStaff([]); // Clear suggestions after selection
  };
  const handleClear = () => {
    setUserName("");
    setUserEmail("");
    setUserRole("");
    setDate("");
  };
  const fetchReport = async () => {
    if (!date) {
      //   alert("Please select a date");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${environment.url}/api/account/get-day-wise-handover-report?date=${date}&username=${userName}&email=${userEmail}&role=${userRole}`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        // console.log("handover report", data);
        // data.aggregatedIpdCollection = aggregatePatientData(data.ipdCollection);
        // data.aggregatedExpenseCollection = aggregateExpenseData(
        //   data.expenses
        // );
        // data.denominations = denominations;
        // data.denominationsTotal = calculateDenominationTotal();
        setReportData(data);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      setNotification("Error fetching data");
      //   alert("Error fetching report data");
      console.error(error);
    }
    setLoading(false);
  };

  const handlePrint = async () => {
    await fetchReport();
    setTimeout(() => {
      printBill();
    }, 100);
  };

  const getTime = () => {
    const date = new Date();
    const time = date.toLocaleTimeString();
    return time;
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
    <div className="page-container">
      <h2 style={{ margin: "0", padding: "0" }}>Insights</h2>
      <div className="form-section no-print">
        <div style={{ display: "flex", width: "fit-content", gap: "20px" }}>
          <div className="form-group" style={{ width: "fit-content" }}>
            <label style={{ margin: "0" }}>Select Staff</label>
            <input
              type="text"
              placeholder="Search staff by name..."
              name="userName"
              value={userName}
              onChange={handleStaffChange}
              style={{ width: "fit-content" }}
            />
            {filteredStaff.length > 0 && (
              <div className="attendence-suggestions">
                {filteredStaff.map((staffMember) => (
                  <div
                    key={staffMember.id} // Assuming each staff has a unique ID
                    className="attendence-suggestion-item"
                    onClick={() => handleStaffSelect(staffMember)}
                  >
                    {staffMember.name} ({staffMember.phone || "N/A"})
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="input-group" style={{ width: "fit-content" }}>
            <label>Select Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button
            onClick={() => handleClear()}
            style={{
              height: "fit-content",
              width: "fit-content",
              margin: "auto 0",
            }}
          >
            Clear
          </button>
        </div>

        <div className="denominations-form">
          <h3>Enter Denomination Details:</h3>
          <div className="denomination-grid">
            {denominations.map((denom, index) => (
              <div key={index} className="denomination-input">
                <label>₹{denom.value}:</label>
                <input
                  type="number"
                  min="0"
                  value={denom.count}
                  onChange={(e) =>
                    handleDenominationChange(index, e.target.value)
                  }
                />
                <span>= ₹{denom.value * denom.count}</span>
              </div>
            ))}
          </div>
          <div className="denomination-total">
            Total: ₹{calculateDenominationTotal()}
          </div>
        </div>

        <div className="button-group">
          {/* <button onClick={fetchReport} disabled={loading}>
            {loading ? "Loading..." : "Get Report"}
          </button> */}
          <button
            onClick={handlePrint}
            disabled={!date}
            style={{ width: "fit-content" }}
          >
            Print Report
          </button>
        </div>
      </div>

      <div className="full-report-print print-only" ref={documentRef}>
        {reportData && (
          <div className="report-container">
            {/* <div className="report-header">
              <div className="total-bill-image-container">
                <img
                  src={hospitalImage}
                  alt="Hospital"
                  className="ds-hospital-image"
                />
              </div>
              <h1>DAY-WISE CASH HANDOVER REPORT</h1>
              <p style={{textAlign: "center"}}>Date: {date}</p>
            </div> */}
            <div className="custom-header">
              <img
                src={prakashLogo}
                alt="Hospital Logo"
                className="hospital-logo"
              />
              <div className="header-text">
                <h2 className="hospital-name" style={{ marginBottom: "0" }}>
                  New Prakash Surgical Clinic
                </h2>
                <p className="hospital-address">
                  38 C Circular Road, Opp. Kauwa Bagh Police Station, Gorakhpur
                  (273012) UP
                </p>
              </div>
              <img
                src={prakashLogo}
                alt="Hospital Logo"
                className="hospital-logoo"
              />
            </div>

            <section className="report-section" style={{ marginBottom: "5px" }}>
              <h3>1. Handover Details</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Handover Time</th>
                    <th>Handover By</th>
                    {/* <th>Overall Collection</th> */}
                    <th>Received By</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{reportData.date}</td>
                    <td>
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                      })}
                    </td>
                    <td>{getTime()}</td>
                    <td>{userName}</td>
                    {/* <td>{reportData.overallCollection}</td> */}
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </section>

            {reportData.ipdCollection.length > 0 && (
              <section
                className="report-section"
                style={{ marginBottom: "5px" }}
              >
                <h3>2. IPD Collections</h3>
                <table>
                  <thead>
                    <tr>
                      {/* <th>Date</th> */}
                      <th>Patient Name</th>
                      <th>UHID</th>
                      <th>TPA Corporate</th>
                      <th>Patient Type</th>
                      <th>Mode</th>
                      <th>Total Amount ₹</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.ipdCollection.map((item, index) => (
                      <tr key={index}>
                        {/* <td>{formatDateToDDMMYYYY(item.date)}</td> */}
                        <td>{item.patientName}</td>
                        <td>{item.uhid}</td>
                        <td>
                          {item?.tpaCorporate?.toLowerCase() !== "unknown"
                            ? item?.tpaCorporate
                            : "-"}
                        </td>
                        <td>{item.patientPaymentType}</td>
                        <td>{item.paymentType}</td>
                        <td>₹{item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="totals-horizontal">
                  <div className="totals-item">
                    <span
                      className="handover-label"
                      style={{ backgroundColor: "white", borderRight: "none" }}
                    >
                      Total Amount:
                    </span>
                    <span className="handover-value">
                      ₹
                      {reportData.ipdCollection.reduce(
                        (total, item) => total + parseFloat(item.amount || 0),
                        0
                      )}
                    </span>
                  </div>
                  <div className="totals-item">
                    <span
                      className="handover-label"
                      style={{ backgroundColor: "white", borderRight: "none" }}
                    >
                      Cash:
                    </span>
                    <span className="handover-value">
                      ₹
                      {reportData.ipdCollection
                        .filter(
                          (item) => item.paymentType.toLowerCase() === "cash"
                        )
                        .reduce(
                          (total, item) => total + parseFloat(item.amount || 0),
                          0
                        )}
                    </span>
                  </div>
                  <div className="totals-item">
                    <span
                      className="handover-label"
                      style={{ backgroundColor: "white", borderRight: "none" }}
                    >
                      Online:
                    </span>
                    <span className="handover-value">
                      ₹
                      {reportData.ipdCollection
                        .filter(
                          (item) => item.paymentType.toLowerCase() !== "cash"
                        )
                        .reduce(
                          (total, item) => total + parseFloat(item.amount || 0),
                          0
                        )}
                    </span>
                  </div>
                </div>
                {/* <hr className="section-divider" /> */}
              </section>
            )}

            {reportData.opdCollection.length > 0 && (
              <section
                className="report-section"
                style={{ marginBottom: "5px" }}
              >
                <h3>3. OPD Collections</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>UHID</th>
                      <th>TPA Corporate</th>
                      <th>Paitent Type</th>
                      <th>Mode</th>
                      <th>Total Amount ₹</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.opdCollection.map((item, index) => (
                      <tr key={index}>
                        <td>{item.patientName}</td>
                        <td>{item.uhid}</td>
                        <td>
                          {item?.tpaCorporate?.toLowerCase() !== "unknown"
                            ? item?.tpaCorporate
                            : "-"}
                        </td>
                        <td>{item.patientPaymentType}</td>
                        <td>{item.paymentType}</td>
                        <td>₹{item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Totals Section */}
                <div className="totals-horizontal">
                  {/* Total Amount */}
                  <div className="totals-item">
                    <span
                      className="handover-label"
                      style={{ backgroundColor: "white", borderRight: "none" }}
                    >
                      Total Amount:
                    </span>
                    <span className="handover-value">
                      ₹
                      {reportData.opdCollection.reduce(
                        (total, item) => total + parseFloat(item.amount || 0),
                        0
                      )}
                    </span>
                  </div>

                  {/* Total Cash Payments */}
                  <div className="totals-item">
                    <span
                      className="handover-label"
                      style={{ backgroundColor: "white", borderRight: "none" }}
                    >
                      Cash :
                    </span>
                    <span className="handover-value">
                      ₹
                      {reportData.opdCollection
                        .filter(
                          (item) => item.paymentType.toLowerCase() === "cash"
                        )
                        .reduce(
                          (total, item) => total + parseFloat(item.amount || 0),
                          0
                        )}
                    </span>
                  </div>

                  {/* Total Credit Payments */}
                  <div className="totals-item">
                    <span
                      className="handover-label"
                      style={{ backgroundColor: "white", borderRight: "none" }}
                    >
                      Credit :
                    </span>
                    <span className="handover-value">
                      ₹
                      {reportData.opdCollection
                        .filter(
                          (item) => item.paymentType.toLowerCase() === "credit"
                        )
                        .reduce(
                          (total, item) => total + parseFloat(item.amount || 0),
                          0
                        )}
                    </span>
                  </div>

                  {/* Total Online Payments (excluding Credit) */}
                  <div className="totals-item">
                    <span
                      className="handover-label"
                      style={{ backgroundColor: "white", borderRight: "none" }}
                    >
                      Online:
                    </span>
                    <span className="handover-value">
                      ₹
                      {reportData.opdCollection
                        .filter(
                          (item) =>
                            item.paymentType.toLowerCase() !== "cash" &&
                            item.paymentType.toLowerCase() !== "credit"
                        )
                        .reduce(
                          (total, item) => total + parseFloat(item.amount || 0),
                          0
                        )}
                    </span>
                  </div>
                </div>
                {/* <hr className="section-divider" /> */}
              </section>
            )}

            {reportData.additionalServiceCollection.length > 0 && (
              <section
                className="report-section"
                style={{ marginBottom: "5px" }}
              >
                <h3>4. Additional Services</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>UHID</th>
                      <th>TPA Corporate</th>
                      <th>Items</th>
                      <th>Patient Type</th>
                      <th>Mode</th>
                      <th>Total Amount ₹</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.additionalServiceCollection.map(
                      (item, index) => (
                        <tr key={index}>
                          <td>{item.patientName}</td>
                          <td>{item.uhid}</td>
                          <td>
                            {item?.tpaCorporate.toLowerCase() !== "unknown"
                              ? item?.tpaCorporate
                              : "-"}
                          </td>
                          <td>{item.items}</td>
                          <td>{item.patientPaymentType}</td>
                          <td>{item.paymentType}</td>
                          <td>₹{item.amount}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
                <div className="totals-horizontal">
                  {/* Total Amount */}
                  <div className="totals-item">
                    <span
                      className="handover-label"
                      style={{ backgroundColor: "white", borderRight: "none" }}
                    >
                      Total Amount:
                    </span>
                    <span className="handover-value">
                      ₹
                      {reportData.additionalServiceCollection.reduce(
                        (total, item) => total + parseFloat(item.amount || 0),
                        0
                      )}
                    </span>
                  </div>

                  {/* Total Cash Payments */}
                  <div className="totals-item">
                    <span
                      className="handover-label"
                      style={{ backgroundColor: "white", borderRight: "none" }}
                    >
                      Cash:
                    </span>
                    <span className="handover-value">
                      ₹
                      {reportData.additionalServiceCollection
                        .filter(
                          (item) => item.paymentType.toLowerCase() === "cash"
                        )
                        .reduce(
                          (total, item) => total + parseFloat(item.amount || 0),
                          0
                        )}
                    </span>
                  </div>

                  {/* Total Credit Payments */}
                  <div className="totals-item">
                    <span
                      className="handover-label"
                      style={{ backgroundColor: "white", borderRight: "none" }}
                    >
                      Credit:
                    </span>
                    <span className="handover-value">
                      ₹
                      {reportData.additionalServiceCollection
                        .filter(
                          (item) => item.paymentType.toLowerCase() === "credit"
                        )
                        .reduce(
                          (total, item) => total + parseFloat(item.amount || 0),
                          0
                        )}
                    </span>
                  </div>

                  {/* Total Online Payments (excluding Credit) */}
                  <div className="totals-item">
                    <span
                      className="handover-label"
                      style={{ backgroundColor: "white", borderRight: "none" }}
                    >
                      Online:
                    </span>
                    <span className="handover-value">
                      ₹
                      {reportData.additionalServiceCollection
                        .filter(
                          (item) =>
                            item.paymentType.toLowerCase() !== "cash" &&
                            item.paymentType.toLowerCase() !== "credit"
                        )
                        .reduce(
                          (total, item) => total + parseFloat(item.amount || 0),
                          0
                        )}
                    </span>
                  </div>
                </div>
                {/* <hr className="section-divider" /> */}
              </section>
            )}

            {reportData.expenses.length > 0 && (
              <section
                className="report-section"
                style={{ marginBottom: "5px" }}
              >
                <h3>5. Expenses</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Particular</th>
                      <th>Payment Mode</th>
                      <th>Total ₹</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.expenses.map((item, index) => (
                      <tr key={index}>
                        <td>{item.type}</td>
                        <td>{item.particular}</td>
                        <td>{item.paymentMode}</td>
                        <td>₹{item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="totals-horizontal">
                  <div className="totals-item">
                    <span
                      className="handover-label"
                      style={{ backgroundColor: "white", borderRight: "none" }}
                    >
                      Total Amount:
                    </span>
                    <span className="handover-value">
                      ₹
                      {reportData.expenses.reduce(
                        (total, item) => total + parseFloat(item.amount || 0),
                        0
                      )}
                    </span>
                  </div>
                  <div className="totals-item">
                    <span
                      className="handover-label"
                      style={{ backgroundColor: "white", borderRight: "none" }}
                    >
                      Cash Payments:
                    </span>
                    <span className="handover-value">
                      ₹
                      {reportData.expenses
                        .filter(
                          (item) => item.paymentMode?.toLowerCase() === "cash"
                        )
                        .reduce(
                          (total, item) => total + parseFloat(item.amount || 0),
                          0
                        )}
                    </span>
                  </div>
                  <div className="totals-item">
                    <span
                      className="handover-label"
                      style={{ backgroundColor: "white", borderRight: "none" }}
                    >
                      Online Payments:
                    </span>
                    <span className="handover-value">
                      ₹
                      {reportData.expenses
                        .filter(
                          (item) => item.paymentMode?.toLowerCase() !== "cash"
                        )
                        .reduce(
                          (total, item) => total + parseFloat(item.amount || 0),
                          0
                        )}
                    </span>
                  </div>
                </div>
              </section>
            )}

            {reportData.dailyCashSummary.length > 0 && (
              <section
                className="report-section"
                style={{ marginBottom: "5px" }}
              >
                <h3>6. Daily Cash Summary</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Number of Patients</th>
                      <th>Cash Payments</th>
                      <th>Online Payments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.dailyCashSummary.map((item, index) => (
                      <tr key={index}>
                        <td>{item.category}</td>
                        <td>{item.patientCount}</td>
                        <td>₹{item.cashAmount}</td>
                        <td>₹{item.onlinePayments}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    {/* Total Row */}
                    <tr className="total-row">
                      <td>Total Expense</td>
                      <td>
                        -
                      </td>
                      <td>
                        -
                      </td>
                      <td>
                        ₹
                        {reportData.expenseTotal}
                      </td>
                    </tr>

                    {/* Extra Row */}
                    {/* <tr className="extra-row">
                      <td colSpan="4">Expenses total</td>
                    </tr> */}
                  </tfoot>
                </table>
                <div className="totals-horizontal">
                  <div className="totals-item">
                    <span
                      className="handover-label"
                      style={{ backgroundColor: "white", borderRight: "none" }}
                    >
                      Total Amount:
                    </span>
                    <span className="handover-value">
                      ₹
                      {(reportData.dailyCashSummary.reduce(
                        (total, item) =>
                          total + parseFloat(item.cashAmount || 0),
                        0
                      ) +
                        reportData.dailyCashSummary.reduce(
                          (total, item) =>
                            total + parseFloat(item.onlinePayments || 0),
                          0
                        )) - reportData.expenseTotal}
                    </span>
                  </div>
                  <div className="totals-item">
                    <span
                      className="handover-label"
                      style={{ backgroundColor: "white", borderRight: "none" }}
                    >
                      Cash Payments:
                    </span>
                    <span className="handover-value">
                      ₹
                      {reportData.dailyCashSummary.reduce(
                        (total, item) =>
                          total + parseFloat(item.cashAmount || 0),
                        0
                      )}
                    </span>
                  </div>
                  <div className="totals-item">
                    <span
                      className="handover-label"
                      style={{ backgroundColor: "white", borderRight: "none" }}
                    >
                      Online Payments:
                    </span>
                    <span className="handover-value">
                      ₹
                      {reportData.dailyCashSummary.reduce(
                        (total, item) =>
                          total + parseFloat(item.onlinePayments || 0),
                        0
                      )}
                    </span>
                  </div>
                  {/* <div className="totals-item">
                    <span
                      className="handover-label"
                      style={{ backgroundColor: "white", borderRight: "none" }}
                    >
                      Total Expenses:
                    </span>
                    <span className="handover-value">
                      ₹
                      {reportData.expenseTotal}
                    </span>
                  </div> */}
                </div>
              </section>
            )}

            {reportData.denominations && (
              <section
                className="report-section"
                style={{ marginBottom: "5px" }}
              >
                <h3>Denomination Details</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Denomination ₹</th>
                      <th>Count</th>
                      <th>Total ₹</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.denominations.map((denom, index) => (
                      <tr key={index}>
                        <td>₹{denom.value}</td>
                        <td>{denom.count}</td>
                        <td>₹{denom.value * denom.count}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan="2">Total</td>
                      <td>₹{reportData.denominationsTotal}</td>
                    </tr>
                  </tfoot>
                </table>
              </section>
            )}

            <section className="report-section" style={{ marginBottom: "0" }}>
              <h3>7. Signature Section</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Signature</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{userName}</td>
                    <td className="designation-cell">Prepared By:</td>
                    <td className="signature-field">_____________</td>
                  </tr>
                  <tr>
                    <td>{user?.name}</td>
                    <td className="designation-cell">Verified By:</td>
                    <td className="signature-field">_____________</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td className="designation-cell">
                      Received By (Director):
                    </td>
                    <td className="signature-field">_____________</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        )}
      </div>

      <style jsx>{`
        .page-container {
          max-width: 1200px;
          margin: 25px auto;
          padding: 10px 20px;
          border-radius: 8px;
          font-family: "Inter", sans-serif;
          background-color: var(--front-op)
        }

        .form-section {
          padding: 20px;
          padding-bottom: 0;
          background-color: var(--front-op)
          border-radius: 8px;
        }

        .input-group {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .input-group label {
          font-weight: 600;
          color: #333333;
        }

        .input-group input {
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s ease;
        }

        .input-group input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
        }

        .denominations-form {
          background-color: var(--front-op);
          border: 1px solid black;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        }

        .denomination-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }

        .denomination-input {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px;
          background: #ffffff;
          border: 1px solid black;
          border-radius: 8px;
          text-align: center;
          transition: box-shadow 0.3s ease, transform 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .denomination-input:hover {
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .denomination-input label {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #1f2937;
        }

        .denomination-input input {
          width: 60%;
          padding: 10px;
          border: 1px solid black;
          border-radius: 8px;
          font-size: 14px;
          text-align: center;
          margin-bottom: 8px;
          outline: none;
          transition: border-color 0.3s ease;
        }

        .denomination-input input:focus {
          border-color: var(--base);
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
        }

        .denomination-input span {
          font-weight: 500;
          color: #4b5563;
          font-size: 14px;
        }

        .denomination-total {
          font-size: 18px;
          font-weight: 700;
          color: black;
          text-align: right;
          margin-top: 20px;
        }

        .button-group {
          display: flex;
          justify-content: flex-start;
          gap: 15px;
        }

        button {
          padding: 10px 16px;
          background: var(--base-hover);
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        button:hover {
          background: var(--base);
        }

        button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .report-container {
          background: #ffffff;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-top: 20px;
        }

        .report-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .report-header h1 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #111827;
        }

        .report-header h2 {
          font-size: 16px;
          font-weight: 600;
          color: #4b5563;
        }

        .report-section {
          margin-bottom: 20px;
        }

        .report-section h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 10px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background-color: #ffffff;
          margin-top: 10px;
          font-size: 12px; /* Smaller font for printing */
        }

        th,
        td {
          border: 1px solid #e5e7eb;
          padding: 8px;
          text-align: left;
        }

        th {
          background-color: #f9fafb;
          font-weight: 700;
          color: #1f2937;
        }

        td {
          font-size: 12px;
          color: #4b5563;
        }

        tr:nth-child(even) {
          background-color: #f3f4f6;
        }

        .total-row {
          font-weight: 600;
          background-color: #e5e7eb;
        }

        .signature-field {
          text-align: center;
          font-style: italic;
        }

        @media print {
          .no-print {
            display: none;
          }

          .report-container {
            box-shadow: none;
          }

          table {
            page-break-inside: avoid;
          }
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 10px;
          }

          th,
          td {
            padding: 6px;
            font-size: 10px; /* Further adjust for mobile printing */
          }

          .report-header h1 {
            font-size: 18px;
          }

          .report-header h2 {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default CashHandoverReport;
