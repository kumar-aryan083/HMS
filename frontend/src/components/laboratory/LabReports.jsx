import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPrint } from "@fortawesome/free-solid-svg-icons";
import Loader from "../Loader.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";
import "./styles/LabReportView.css";
import hospitalImage from "../../assets/hospital.jpg";
import prakashLogo from "../../assets/prakashLogo.jpg";
import { useReactToPrint } from "react-to-print";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const LabReports = () => {
  const { setNotification } = useContext(AppContext);
  const [labReports, setLabReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [itemsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportToPrint, setReportToPrint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [isEditing, setIsEditing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  const reportRef = useRef();

  const printReport = useReactToPrint({
    contentRef: reportRef,
  });

  useEffect(() => {
    fetchLabReports();
  }, [currentPage]);

  const fetchLabReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/lab/get-lab-reports?limit=${itemsPerPage}&page=${currentPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log("All lab reports: ", data);
        setLabReports(data.items);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    return labReports.filter((report) => {
      if (activeTab === "pending") {
        return !report.collected && !report.reported;
      } else if (activeTab === "inReview") {
        return report.collected && !report.reported;
      } else if (activeTab === "completed") {
        return report.collected && report.reported;
      }
    });
  };

  const currentItems = filterReports();

  const handleAddResult = (report) => {
    setSelectedReport(report);
    setIsEditing(true);
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setIsEditing(false);
  };

  const handlePrint = (report) => {
    setReportToPrint(report);
    setTimeout(() => {
      printReport();
    }, 50);
  };

  const closeModal = () => {
    setSelectedReport(null);
  };

  const moveToPrev = async (report) => {
    try {
      const res = await fetch(
        `${environment.url}/api/lab/prev-lab-report/${report._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log("updated reported date", data);
        setNotification(data.message);
        setLabReports((prevReports) =>
          prevReports.map((existingReport) =>
            existingReport._id === data.report._id
              ? data.report
              : existingReport
          )
        );
        setIsModalOpen(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const moveToReview = async (report) => {
    try {
      const res = await fetch(
        `${environment.url}/api/lab/update-collected-date/${report._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log("updated collected date", data);
        setNotification(data.message);
        setLabReports((prevReports) =>
          prevReports.map((existingReport) =>
            existingReport._id === data.report._id
              ? data.report
              : existingReport
          )
        );
        setIsModalOpen(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSaveChanges = async (report) => {
    // console.log("added report: ", report);
    const updatedReport = { ...report, reviewNotes };
    // console.log("added report: ", updatedReport);
    try {
      const res = await fetch(
        `${environment.url}/api/lab/update-lab-report/${report._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(updatedReport),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        setLabReports((prevReports) =>
          prevReports.map((existingReport) =>
            existingReport._id === data.report._id
              ? data.report
              : existingReport
          )
        );
        setSelectedReport(null);
        setReviewNotes("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      fetchLabReports();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      fetchLabReports();
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
    <>
      <div style={{ margin: "15px 50px" }}>
        <div className="upper-wing">
          <h2>Lab Test Reports</h2>
          {/* <button onClick={() => setIsModalOpen(true)}>Add Test Report</button> */}
        </div>

        <div className="report-tab-container">
          <button onClick={() => setActiveTab("pending")}>Pending</button>
          <button onClick={() => setActiveTab("inReview")}>In Review</button>
          <button onClick={() => setActiveTab("completed")}>Completed</button>
        </div>

        <div style={{ fontWeight: "500" }}>
          {activeTab.toUpperCase()} Reports
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="lower-wing">
            <table className="wing-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Bill Number</th>
                  <th>Report Number</th>
                  <th>UHID</th>
                  <th>Patient Name</th>
                  <th>Test Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((report, index) => (
                    <tr key={report._id}>
                      <td>{index + 1}</td>
                      <td>{report.billNumber}</td>
                      <td>{report.reportNumber}</td>
                      <td>{report.patientId?.uhid}</td>
                      <td>{report.patientId?.patientName}</td>
                      <td>{report.labTest?.testName}</td>
                      <td>{report.labTest?.testStatus}</td>
                      <td className="lab-report-btn">
                        <div
                          className="lab-action-btn"
                          onClick={() => handleViewReport(report)}
                        >
                          View
                        </div>
                        {activeTab === "pending" && (
                          <div
                            className="lab-action-btn"
                            onClick={() => moveToReview(report)}
                          >
                            Write
                          </div>
                        )}
                        {activeTab === "completed" && (
                          <div
                            className="lab-action-btn"
                            onClick={() => handlePrint(report)}
                          >
                            Print
                          </div>
                        )}
                        {activeTab === "completed" && (
                          <div
                            className="lab-action-btn"
                            onClick={() => moveToPrev(report)}
                          >
                            Prev
                          </div>
                        )}
                        {activeTab === "inReview" && (
                          <div
                            className="lab-action-btn"
                            onClick={() => handleAddResult(report)}
                          >
                            Add Result
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      No Lab Reports Available to Show
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
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {selectedReport && (
        <div className="report-view-modal" style={{ display: "flex" }}>
          <div className="report-view-modal-content">
            {/* <div className="total-bill-image-container">
              <img
                src={hospitalImage}
                alt="Hospital"
                className="total-hospital-image"
              />
            </div> */}
            <span className="opd-closeBtn" onClick={closeModal}>
              X
            </span>

            <div className="top-border">
              <div className="patient-details-container">
                {[
                  {
                    label: "Report Number",
                    value: selectedReport.reportNumber,
                  },
                  {
                    label: "Patient UHID",
                    value: selectedReport.patientId?.uhid,
                  },
                  {
                    label: "Patient Name",
                    value: selectedReport.patientId?.patientName,
                  },
                  { label: "Gender", value: selectedReport.patientId?.gender },
                  { label: "Mobile", value: selectedReport.patientId?.mobile },
                  { label: "Age", value: selectedReport.patientId?.age },
                  {
                    label: "Prescribed By",
                    value: selectedReport.prescribedByName,
                  },
                  {
                    label: "Report Date",
                    value: selectedReport.reported
                      ? formatDateToDDMMYYYY(selectedReport.reported)
                      : "-",
                  },
                ].map((detail, index) => (
                  <div key={index} className="patient-detail">
                    <div className="patient-label">{detail.label}:</div>
                    <div className="patient-value">{detail.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <h3 style={{ marginTop: "10px", fontSize: "20px" }}>
              Lab Report Details
            </h3>
            <h2 style={{ fontSize: "15px" }}>
              {selectedReport.labTest.testName.toUpperCase()}
            </h2>
            {selectedReport.labTest.testComponents?.length > 0 ? (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Value</th>
                    <th>Unit</th>
                    <th>Reference Value</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReport.labTest.testComponents.map(
                    (component, idx) => (
                      <tr key={idx}>
                        <td>{component.componentName}</td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              defaultValue={component.result || ""}
                              onChange={(e) => {
                                component.result = e.target.value;
                              }}
                            />
                          ) : (
                            component.result || "-"
                          )}
                        </td>
                        <td>{component.unit || "-"}</td>
                        <td>
                          {component.referenceValue?.min} -{" "}
                          {component.referenceValue?.max}{" "}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            ) : (
              <p>No test components available.</p>
            )}

            {!isEditing && (
              <div className="clinical-notes">
                <h4>Clinical Notes</h4>
                <div>
                  <div
                    style={{ textAlign: "left" }}
                    dangerouslySetInnerHTML={{
                      __html: selectedReport?.reviewNotes || "N/A",
                    }}
                  ></div>
                </div>
              </div>
            )}

            {isEditing && (
              <div style={{ marginTop: "30px" }}>
                <h4 htmlFor="reviewNotes">Add Review Note</h4>
                <ReactQuill
                  theme="snow"
                  value={reviewNotes}
                  onChange={setReviewNotes}
                  placeholder="Write review for this report..."
                  modules={{
                    toolbar: [
                      // Text styles
                      [{ header: [1, 2, 3, false] }], // Header sizes
                      [{ font: [] }], // Font selection
                      [{ size: ["small", false, "large", "huge"] }], // Font size

                      // Formatting options
                      ["bold", "italic", "underline", "strike"], // Text formatting
                      [{ color: [] }, { background: [] }], // Text and background color
                      [{ script: "sub" }, { script: "super" }], // Subscript / superscript
                      ["blockquote", "code-block"], // Blockquote and code block

                      // List and indentation
                      [{ list: "ordered" }, { list: "bullet" }], // Ordered and unordered lists
                      [{ indent: "-1" }, { indent: "+1" }], // Indentation
                      [{ align: [] }], // Text alignment

                      // Media and links
                      ["link", "image", "video"], // Insert links, images, and videos

                      // Miscellaneous
                      ["clean"], // Remove formatting
                    ],
                  }}
                  formats={[
                    "header",
                    "font",
                    "size",
                    "bold",
                    "italic",
                    "underline",
                    "strike",
                    "color",
                    "background",
                    "script",
                    "blockquote",
                    "code-block",
                    "list",
                    "bullet",
                    "indent",
                    "align",
                    "link",
                    "image",
                    "video",
                  ]}
                />
              </div>
            )}

            {isEditing && (
              <button
                className="save-button"
                style={{ width: "fit-content", marginTop: "20px" }}
                onClick={() => handleSaveChanges(selectedReport)}
              >
                Save Changes
              </button>
            )}

            {/* <button className="print-button" onClick={handlePrint}>
              Print
            </button> */}
          </div>
        </div>
      )}

      {reportToPrint && (
        <PrintReport report={reportToPrint} printRef={reportRef} />
      )}
    </>
  );
};

const PrintReport = ({ report, printRef }) => {
  if (!report) return null;

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
    <div ref={printRef} className="ipd-bill-layout print-only">
      {/* <div className="total-bill-image-container">
        <img src={hospitalImage} alt="Hospital" className="ds-hospital-image" />
      </div> */}
{/* Custom Header */}
      <div className="custom-header">
        <img src={prakashLogo} alt="Hospital Logo" className="hospital-logo" />
        <div className="header-text">
          <h2 className="hospital-name" style={{ marginBottom: "0" }}>
            New Prakash Surgical Clinic
          </h2>
          <p className="hospital-address">
            38 C Circular Road, Opp. Kauwa Bagh Police Station, Gorakhpur
            (273012) UP
          </p>
        </div>
        <img src={prakashLogo} alt="Hospital Logo" className="hospital-logoo" />
      </div>
      <div className="top-border">
        <div className="patient-details-container">
          {[
            { label: "Report Number", value: report.reportNumber },
            { label: "Patient UHID", value: report.patientId?.uhid },
            { label: "Patient Name", value: report.patientId?.patientName },
            { label: "Gender", value: report.patientId?.gender },
            { label: "Mobile", value: report.patientId?.mobile },
            { label: "Age", value: report.patientId?.age },
            { label: "Prescribed By", value: report.prescribedByName },
            {
              label: "Report Date",
              value: report.reported
                ? formatDateToDDMMYYYY(report.reported)
                : "-",
            },
          ].map((detail, index) => (
            <div key={index} className="patient-detail">
              <div className="patient-label">{detail.label}:</div>
              <div className="patient-value">{detail.value}</div>
            </div>
          ))}
        </div>
      </div>

      <h3 style={{ marginTop: "10px" }}>Lab Report Details</h3>
      <h2>{report?.labTest.testName.toUpperCase()}</h2>
      {/* <h3>Test Components</h3> */}
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Value</th>
            <th>Unit</th>
            <th>Reference Range</th>
          </tr>
        </thead>
        <tbody>
          {report.labTest?.testComponents.map((component, idx) => (
            <tr key={idx}>
              <td style={{ textAlign: "center" }}>{component.componentName}</td>
              <td style={{ textAlign: "center" }}>{component.result || "-"}</td>
              <td style={{ textAlign: "center" }}>{component.unit || "-"}</td>
              <td style={{ textAlign: "center" }}>
                {component.referenceValue?.min} -{" "}
                {component.referenceValue?.max}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="clinical-notes">
        <h4>Clinical Notes</h4>
        <div>
          <div
            dangerouslySetInnerHTML={{
              __html: report?.reviewNotes || "N/A",
            }}
          ></div>
        </div>
      </div>

      <div className="report-space-signature">
        <div className="report-signature-section">
          <p style={{ color: "black" }}>________________________</p>
          <p>
            <strong style={{ color: "black" }}>Mr. Sachin Sharma</strong>
            <p style={{ color: "black" }}>DMLT. Lab Incharge</p>
          </p>
        </div>
        <div className="report-signature-section">
          <p style={{ color: "black" }}>__________________________________</p>
          <p>
            <strong style={{ color: "black" }}>Dr. A K Asthana</strong>
            <p style={{ color: "black" }}>MBBS, MD, Pathologist</p>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LabReports;
