import React, { useState, useEffect, useContext } from "react";
import { environment } from "../../../utlis/environment";
import "./styles/AccountsIncomeReport.css";
import { AppContext } from "../../context/AppContext";
import Loader from "../Loader";
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
} from "../../../utlis/exportBillsReport";

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

const IpdReport = ({ data }) => {
  return (
    <>
      <table className="income-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Patient Name</th>
            <th>UHID</th>
            <th>Mobile</th>
            <th>Doctor</th>
            <th>Patient Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index}>
              <td>{formatDateToDDMMYYYY(item.date)}</td>
              <td>{item.billType}</td>
              <td>{item.patientName}</td>
              <td>{item.uhid || "-"}</td>
              <td>{item.mobile || "-"}</td>
              <td>{item.referenceDoctor || "-"}</td>
              <td>{item.patientPaymentType}</td>
              <td>{item.amount}</td>
            </tr>
          ))}
          {/* <tr className="total-row">
            <td colSpan="7" style={{ textAlign: "right" }}>
              Total:
            </td>
            <td>{data.total}</td>
          </tr> */}
        </tbody>
      </table>
    </>
  );
};

const OpdReport = ({ data }) => {
  return (
    <>
      <table className="income-table">
        <thead>
          <tr>
            <th>Date</th>
            {/* <th>Type</th> */}
            <th>Patient Name</th>
            <th>UHID</th>
            <th>Patient Type</th>
            <th>Mode</th>
            <th>Doctor</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index}>
              <td>{formatDateToDDMMYYYY(item.date)}</td>
              {/* <td>{item.billType}</td> */}
              <td>{item.patientName}</td>
              <td>{item.uhid || "-"}</td>
              <td>{item.patientPaymentType || "-"}</td>
              <td>{item.mode || "-"}</td>
              <td>{item.referenceDoctor || "-"}</td>
              <td>{item.amount}</td>
            </tr>
          ))}
          {/* <tr className="total-row">
            <td colSpan="6" style={{ textAlign: "right" }}>
              Total:
            </td>
            <td>{data.total}</td>
          </tr> */}
        </tbody>
      </table>
    </>
  );
};
const PharmacyReport = ({ data }) => {
  return (
    <>
      <table className="income-table">
        <thead>
          <tr>
            <th>Date</th>
            {/* <th>Type</th> */}
            <th>Patient Name</th>
            <th>UHID</th>
            <th>Mode</th>
            <th>Doctor</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index}>
              <td>{formatDateToDDMMYYYY(item.date)}</td>
              {/* <td>{item.billType}</td> */}
              <td>{item.patientName}</td>
              <td>{item.uhid || "-"}</td>
              <td>{item.mode || "-"}</td>
              <td>{item.prescribedByName || "-"}</td>
              <td>{item.amount}</td>
            </tr>
          ))}
          {/* <tr className="total-row">
            <td colSpan="5" style={{ textAlign: "right" }}>
              Total:
            </td>
            <td>{data.total}</td>
          </tr> */}
        </tbody>
      </table>
    </>
  );
};
const LabReports = ({ data }) => {
  return (
    <>
      <table className="income-table">
        <thead>
          <tr>
            <th>Date</th>
            {/* <th>Type</th> */}
            <th>Patient Name</th>
            <th>UHID</th>
            <th>Mode</th>
            <th>Doctor</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index}>
              <td>{formatDateToDDMMYYYY(item.date)}</td>
              {/* <td>{item.billType}</td> */}
              <td>{item.patientName}</td>
              <td>{item.uhid || "-"}</td>
              <td>{item.mode || "-"}</td>
              <td>{item.prescribedByName || "-"}</td>
              <td>{item.amount}</td>
            </tr>
          ))}
          {/* <tr className="total-row">
            <td colSpan="5" style={{ textAlign: "right" }}>
              Total:
            </td>
            <td>{data.total}</td>
          </tr> */}
        </tbody>
      </table>
    </>
  );
};

const MiscReport = ({ data }) => {
  return (
    <>
      <table className="income-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Head</th>
            <th>Details</th>
            <th>Time</th>
            <th>Mode</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index}>
              <td>{formatDateToDDMMYYYY(item.date)}</td>
              <td>{item.head}</td>
              <td>{item.details}</td>
              <td>{item.time}</td>
              <td>{item.mode}</td>
              <td>{item.amount}</td>
            </tr>
          ))}
          {/* <tr className="total-row">
            <td colSpan="5" style={{ textAlign: "right" }}>
              Total:
            </td>
            <td>{data.total}</td>
          </tr> */}
        </tbody>
      </table>
    </>
  );
};
const SupplierReport = ({ data }) => {
  return (
    <>
      <table className="income-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Supplier Name</th>
            <th>Supplier Bill Number</th>
            <th>Total Medicine</th>
            <th>Mode</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index}>
              <td>{formatDateToDDMMYYYY(item.billDate)}</td>
              <td>{item.supplierName}</td>
              <td>{item.supplierBillNumber}</td>
              <td>{item.totalMed}</td>
              <td>{item.mode}</td>
              <td>{item.amount}</td>
            </tr>
          ))}
          {/* <tr className="total-row">
            <td colSpan="5" style={{ textAlign: "right" }}>
              Total:
            </td>
            <td>{data.total}</td>
          </tr> */}
        </tbody>
      </table>
    </>
  );
};
const AdditionalServiceReport = ({ data }) => {
  return (
    <>
      <table className="income-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Patient Name</th>
            <th>UHID</th>
            <th>Prescribed By</th>
            <th>Mode</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index}>
              <td>{formatDateToDDMMYYYY(item.date)}</td>
              <td>{item.patientName}</td>
              <td>{item.uhid}</td>
              <td>{item.prescribedByName}</td>
              <td>{item.mode}</td>
              <td>{item.amount}</td>
            </tr>
          ))}
          {/* <tr className="total-row">
            <td colSpan="5" style={{ textAlign: "right" }}>
              Total:
            </td>
            <td>{data.total}</td>
          </tr> */}
        </tbody>
      </table>
    </>
  );
};

const AccountsIncomeReport = () => {
  const [startDate, setStartDate] = useState("2024-11-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [report, setReport] = useState({
    ipdReport: { items: [], total: 0 },
    opdReport: { items: [], total: 0 },
    miscReport: { items: [], total: 0 },
    pharmacyReport: { items: [], total: 0 },
    labReport: { items: [], total: 0 },
    supplierReport: { items: [], total: 0 },
    additionalServiceReport: { items: [], total: 0 },
  });
  const [originalReport, setOriginalReport] = useState({
    ipdReport: { items: [], total: 0 },
    opdReport: { items: [], total: 0 },
    miscReport: { items: [], total: 0 },
    pharmacyReport: { items: [], total: 0 },
    labReport: { items: [], total: 0 },
    supplierReport: { items: [], total: 0 },
    additionalServiceReport: { items: [], total: 0 },
  });
  const [activeTab, setActiveTab] = useState("ipdReport");
  const [loading, setLoading] = useState(false);
  const [billType, setBillType] = useState("");
  const [uhid, setUhid] = useState("");
  const [patientName, setPatientName] = useState("");
  const [mode, setMode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [activeTabTotal, setActiveTabTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalAmounts, setTotalAmounts] = useState({
    totalAmount: 0,
    cashAmount: 0,
    creditAmount: 0,
    onlineAmount: 0
  });


  useEffect(() => {
    fetchReport();
  }, []);
  useEffect(() => {
    // Update the active tab's total whenever the activeTab or filtered data changes
    const currentReport = getFilteredData(activeTab);
    setActiveTabTotal(currentReport.total);

    if (activeTab !== "ipdReport") {
      calculateModeTotals(currentReport);
    } else {
      // For IPD, just set total amount
      setTotalAmounts({
        totalAmount: currentReport.total,
        cashAmount: 0,
        creditAmount: 0,
        onlineAmount: 0
      });
    }

  }, [activeTab, report, billType, uhid, patientName, mode]);

  const calculateModeTotals = (data) => {
    const cashAmount = data.items
      .filter(item => item.mode === 'cash')
      .reduce((acc, item) => acc + parseFloat(item.amount || 0), 0);
  
    const creditAmount = data.items
      .filter(item => item.mode === 'credit')
      .reduce((acc, item) => acc + parseFloat(item.amount || 0), 0);
  
    const onlineAmount = data.items
      .filter(item => item.mode !== 'cash' && item.mode !== 'credit')
      .reduce((acc, item) => acc + parseFloat(item.amount || 0), 0);
  
    setTotalAmounts({
      totalAmount: parseFloat(data.total || 0),
      cashAmount,
      creditAmount,
      onlineAmount
    });
  };

  const fetchData = async () => {
    // console.log("fetchData");
    fetchReport();
  };

  const fetchReport = async () => {
    // console.log("inside fetchReport");
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/account/get-income-report?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log("report data: ", data);
        setReport(data.report);
        setOriginalReport(data.report);
      }
    } catch (error) {
      console.error("Error fetching income report:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data) => {
    let filteredData = data;

    if (["ipdReport", "opdReport"].includes(activeTab)) {
      if (billType) {
        filteredData = filterReportByBillType(filteredData, billType);
      }
    }

    if (uhid) {
      filteredData = filterReportByUhid(filteredData, uhid);
    }
    if (patientName) {
      filteredData = filterReportByPatientName(filteredData, patientName);
    }
    if (mobileNumber) {
      filteredData = filterReportByMobile(filteredData, mobileNumber);
    }
    if (["pharmacyReport", "labReport", "additionalService", "opdReport"].includes(activeTab) && mode) {
      filteredData = filterReportByMode(filteredData, mode);
    }
    return filteredData;
  };

  const filterReportByMobile = (data, mobileNumber) => {
    if (mobileNumber.trim() === "") return data;
    return {
      ...data,
      items: data.items.filter((item) =>
        item.mobile?.toString().includes(mobileNumber.trim())
      ),
      total: data.items
        .filter((item) => 
          item.mobile?.toString().includes(mobileNumber.trim())
        )
        .reduce((acc, item) => acc + parseFloat(item.amount || 0), 0),
    };
  };

  const filterReportByBillType = (data, billType) => {
    if (billType === "") return data;
    return {
      ...data,
      items: data.items.filter((item) => item.billType === billType),
      total: data.items
        .filter((item) => item.billType === billType)
        .reduce((acc, item) => acc + item.amount, 0),
    };
  };

  const filterReportByUhid = (data, uhid) => {
    if (uhid.trim() === "") return data;
    return {
      ...data,
      items: data.items.filter((item) =>
        item.uhid?.toString().includes(uhid.trim())
      ),
      total: data.items
        .filter((item) => item.uhid?.toString().includes(uhid.trim()))
        .reduce((acc, item) => acc + item.amount, 0),
    };
  };

  const filterReportByPatientName = (data, patientName) => {
    if (patientName.trim() === "") return data;
    return {
      ...data,
      items: data.items.filter((item) =>
        item.patientName?.toLowerCase().includes(patientName.toLowerCase())
      ),
      total: data.items
        .filter((item) =>
          item.patientName?.toLowerCase().includes(patientName.toLowerCase())
        )
        .reduce((acc, item) => acc + item.amount, 0),
    };
  };
  const filterReportByMode = (data, mode) => {
    if (mode.trim() === "") return data;
    // console.log("mode data", data, mode)
    return {
      ...data,
      items: data.items.filter((item) => item.mode === mode),
      total: data.items
        .filter((item) => item.mode === mode)
        .reduce((acc, item) => acc + item.amount, 0),
    };
  };

  // const filteredIpdReport = applyFilters(originalReport.ipdReport);
  // const filteredOpdReport = applyFilters(originalReport.opdReport);
  // const filteredLabReport = applyFilters(originalReport.labReport);
  // const filteredPharmacyReport = applyFilters(originalReport.pharmacyReport);

  

  const renderPagination = () => (
    <div className="pagination">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((prev) => prev - 1)}
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          className={currentPage === index + 1 ? "active" : ""}
          onClick={() => setCurrentPage(index + 1)}
        >
          {index + 1}
        </button>
      ))}
      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((prev) => prev + 1)}
      >
        Next
      </button>
    </div>
  );

  const getFilteredData = (tab) => {
    switch (tab) {
      case "ipdReport":
        return applyFilters(originalReport.ipdReport);
      case "opdReport":
        return applyFilters(originalReport.opdReport);
      case "pharmacyReport":
        return applyFilters(originalReport.pharmacyReport);
      case "labReport":
        return applyFilters(originalReport.labReport);
      case "supplierReport":
        return applyFilters(originalReport.supplierReport);
      case "miscReport":
        return originalReport.miscReport;
      case "additionalService":
        return applyFilters(originalReport.additionalServiceReport);
      default:
        return { items: [], total: 0 };
    }
  };

  const paginateData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      ...data,
      items: data.items.slice(startIndex, endIndex),
    };
  };

  const totalPages = Math.ceil(
    getFilteredData(activeTab).items.length / itemsPerPage
  );

  const renderReport = () => {
    if (loading) {
      return <Loader />;
    }
    const filteredData = paginateData(getFilteredData(activeTab));
    switch (activeTab) {
      case "ipdReport":
        return <IpdReport data={filteredData} />;
      case "opdReport":
        return <OpdReport data={filteredData} />;
      case "miscReport":
        return <MiscReport data={report.miscReport} />;
      case "pharmacyReport":
        return <PharmacyReport data={filteredData} />;
      case "labReport":
        return <LabReports data={filteredData} />;
      case "supplierReport":
        return <SupplierReport data={filteredData} />;
      case "additionalService":
        return <AdditionalServiceReport data={filteredData} />;
      default:
        return null;
    }
  };


  return (
    <div className="report-container" style={{margin: "10px 25px"}}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          height: "fit-content",
          margin:"auto 0"
        }}
      >
        <h2 style={{height:"fit-content", margin:"auto 0"}}>Bills Report</h2>
        <div
          className="export-buttons"
          style={{ display: "flex", gap: "10px" }}
        >
          <button
            className="export-btn"
            onClick={() => exportToExcel(getFilteredData(activeTab), activeTab)}
          >
            Excel
          </button>
          <button
            className="export-btn"
            onClick={() => exportToCSV(getFilteredData(activeTab), activeTab)}
          >
            CSV
          </button>
          <button
            className="export-btn"
            onClick={() => exportToPDF(getFilteredData(activeTab), activeTab)}
          >
            PDF
          </button>
        </div>
        <div className="date-filters" style={{margin: "0"}}>
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
      <hr className="am-h-line" style={{ margin: "0" }} />
      <div className="accounts-date">
        <div style={{ display: "flex", gap: "20px" }}>
          
          {(activeTab === "ipdReport" || activeTab === "opdReport") && (
            <div style={{ width: "fit-content", margin: "auto 0" }}>
              <label>Bill Type:</label>
              <select
                value={billType}
                onChange={(e) => setBillType(e.target.value)}
              >
                <option value="">Select Type</option>
                <option value="All">All</option>
                <option value="Ipd">IPD</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Lab Test">Laboratory</option>
              </select>
            </div>
          )}
          {["pharmacyReport", "labReport", "additionalService", "opdReport"].includes(activeTab) && (
            <div style={{ width: "fit-content", margin: "auto 0" }}>
              <label>Mode:</label>
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="">Select Mode</option>
                <option value="credit">Credit</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
              </select>
            </div>
          )}
          {["pharmacyReport", "labReport", "ipdReport", "opdReport", "additionalService"].includes(
            activeTab
          ) && (
            <div style={{ margin: "auto 0" }}>
              <label>UHID:</label>
              <input
                type="text"
                value={uhid}
                onChange={(e) => setUhid(e.target.value)}
                placeholder="Enter UHID"
              />
            </div>
          )}
          {["pharmacyReport", "labReport", "ipdReport", "opdReport", "additionalService"].includes(
            activeTab
          ) && (
            <div style={{ margin: "auto 0" }}>
              <label>Patient Name:</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter Patient Name"
              />
            </div>
          )}
          {["pharmacyReport", "labReport", "ipdReport", "opdReport", "additionalService"].includes(
          activeTab
        ) && (
          <div style={{ margin: "auto 0" }}>
            <label>Mobile Number:</label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter Mobile Number"
            />
          </div>
        )}
          {["pharmacyReport", "labReport", "ipdReport", "opdReport", "additionalService"].includes(
            activeTab
          ) && (
            <div style={{ margin: "auto 0" }}>
              <button
                style={{ marginTop: "35px", fontWeight: "500" }}
                onClick={() => {
                  setBillType("");
                  setUhid("");
                  setPatientName("");
                  setMode("");
                  setMobileNumber("");
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <hr className="am-h-line" />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className="accounts-tabs">
            {[
              { key: "ipdReport", label: "IPD" },
              { key: "opdReport", label: "OPD" },
              { key: "pharmacyReport", label: "Pharmacy" },
              { key: "labReport", label: "Laboratory" },
              { key: "supplierReport", label: "Supplier Report" },
              { key: "miscReport", label: "Miscellaneous" },
              { key: "additionalService", label: "Additional Service" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`single-tab ${
                  activeTab === tab.key ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* <div
            className="tab-total"
            style={{ margin: "auto 0", fontWeight: "bold" }}
          >
            <span>
              Total: {activeTabTotal.toLocaleString()}
            </span>
          </div> */}
        </div>
          <div 
          className="tab-total" 
          style={{ margin: "auto 0", fontWeight: "bold", display: "flex", gap: "15px" }}
        >
          <span>Total: {activeTabTotal.toLocaleString()}</span>
          {activeTab !== "ipdReport" && (
            <>
              <span>Cash: {totalAmounts.cashAmount.toLocaleString()}</span>
              <span>Credit: {totalAmounts.creditAmount.toLocaleString()}</span>
              <span>Online: {totalAmounts.onlineAmount.toLocaleString()}</span>
            </>
          )}
        </div>
      </div>
      <div className="table-container">
        {renderReport()}
        {renderPagination()}
      </div>
    </div>
  );
};

export default AccountsIncomeReport;
