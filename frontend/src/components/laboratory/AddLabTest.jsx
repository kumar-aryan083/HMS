import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import "./styles/AddLabTest.css";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";
import AddLabTestModal from "./AddLabTestModal.jsx";
import AsyncSelect from "react-select/async";
import Loader from "../Loader.jsx";
import * as XLSX from "xlsx"; // Import xlsx library
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables

const AddLabTest = () => {
  const { setNotification, user } = useContext(AppContext);
  const [labTests, setLabTests] = useState([]);
  const [filteredLabTests, setFilteredLabTests] = useState([]);
  const [preloadedData, setPreloadedData] = useState({
    labCategories: [],
    patientTypes: [],
    departments: [],
    reportingTemps: [],
    labTestComponents: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    reportingName: "",
    reportTempName: "",
    reportTemp: "",
    labCategory: null,
    labCategoryName: "",
    department: null,
    departmentName: "",
    patientTypes: [
      {
        patientType: null,
        patientTypeName: "",
        generalFees: 0,
      },
    ],
    railwayCategory: "",
    railwayCode: "",
    nabhPrice: 0,
    nonNabhPrice: 0,
    displaySequence: 1000,
    runNoType: "",
    // specimen: "",
    interpretation: "",
    // isSmsApplicable: false,
    // isLisApplicable: false,
    // isValidForReporting: false,
    // taxApplicable: false,
    // isOutsourcedTest: false,
    // hasNegativeResults: false,
    // negativeResultText: "",
    defaultOutsourceVendor: "",
    components: [""],
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState(""); // Add state for search query
  // const [totalPages, setTotalPages] = useState(null);

  const editRef = useRef();

  useEffect(() => {
    fetchPatientTypes();
    fetchLabTests();
    fetchLabCategories();
    fetchDepartments();
    fetchReportingTemp();
    fetchLabTestComponents();
  }, []);

  const fetchLabCategories = async () => {
    try {
      const res = await fetch(`${environment.url}/api/lab/get-lab-categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        const labCategories = data.labCategories.map((cat) => ({
          value: cat._id,
          label: cat.name,
        }));
        setPreloadedData((preloadedData) => ({
          ...preloadedData,
          labCategories: labCategories,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPatientTypes = async () => {
    try {
      const res = await fetch(
        `${environment.url}/api/common/get-patient-type`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        const patientTypes = data.patientTypes.map((type) => ({
          value: type._id,
          label: type.name,
        }));
        setPreloadedData((preloadedData) => ({
          ...preloadedData,
          patientTypes: patientTypes,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${environment.url}/api/admin/get-departments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        const departments = data.departments.map((dept) => ({
          value: dept._id,
          label: dept.name,
        }));
        setPreloadedData((preloadedData) => ({
          ...preloadedData,
          departments: departments,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchReportingTemp = async () => {
    try {
      const res = await fetch(`${environment.url}/api/lab/get-lab-temps`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        const reportingTemps = data.labTemps.map((temp) => ({
          value: temp._id,
          label: temp.name,
        }));
        setPreloadedData((preloadedData) => ({
          ...preloadedData,
          reportingTemps: reportingTemps,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLabTestComponents = async () => {
    try {
      const res = await fetch(`${environment.url}/api/lab/get-components`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        const labTestComponents = data.components.map((comp) => ({
          value: comp._id,
          label: comp.name,
        }));
        setPreloadedData((preloadedData) => ({
          ...preloadedData,
          labTestComponents: labTestComponents,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLabTests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/lab/get-new-lab-tests`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setLabTests(data.labTests);
        setFilteredLabTests(data.labTests);
        // setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLabTest = async (labTest) => {
    // console.log(labTest);
    try {
      const res = await fetch(`${environment.url}/api/lab/add-new-lab-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(labTest),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        setForm({
          name: "",
          code: "",
          reportingName: "",
          reportTempName: "",
          reportTemp: "",
          labCategory: null,
          labCategoryName: "",
          department: null,
          departmentName: "",
          patientTypes: [
            {
              patientType: null,
              patientTypeName: "",
              generalFees: 0,
            },
          ],
          railwayCategory: "",
          railwayCode: "",
          nabhPrice: 0,
          nonNabhPrice: 0,
          displaySequence: 1000,
          runNoType: "",
          // specimen: "",
          interpretation: "",
          // isSmsApplicable: false,
          // isLisApplicable: false,
          // isValidForReporting: false,
          // taxApplicable: false,
          // isOutsourcedTest: false,
          // hasNegativeResults: false,
          // negativeResultText: "",
          defaultOutsourceVendor: "",
          components: [""],
        });
        fetchLabTests();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteLabTest = async (labTestId) => {
    // console.log(labTestId);
    try {
      const res = await fetch(
        `${environment.url}/api/lab/delete-new-lab-test/${labTestId}`,
        {
          method: "DELETE",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        fetchLabTests();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    editRef.current.style.display = "none";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => {
      if (name === "patientType") {
        const selectedPatientType = patientTypes.find(
          (type) => type._id === value
        );
        return {
          ...prevForm,
          patientType: value,
          patientTypeName: selectedPatientType ? selectedPatientType.name : "",
          railwayCategory: "",
          nabhPrice: "",
          nonNabhPrice: "",
          railwayCode: "",
        };
      }

      return {
        ...prevForm,
        [name]: value,
      };
    });
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle filter click
  const handleFilterClick = () => {
    if (searchQuery) {
      setFilteredLabTests(
        labTests.filter((test) =>
          test.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredLabTests(labTests); // Reset to show all tests when no search query
    }
  };

  const handleEditing = (labTest) => {
    // console.log(labTest);
    editRef.current.style.display = "flex";
    setId(labTest._id);
    setForm({
      name: labTest.name,
      code: labTest.code,
      reportingName: labTest.reportingName,
      reportTemp: labTest.reportTemp,
      reportTempName: labTest.reportTempName,
      labCategory: labTest.labCategory,
      labCategoryName: labTest.labCategoryName,
      department: labTest.department,
      departmentName: labTest.departmentName,
      patientTypes: labTest.patientTypes,
      railwayCategory: labTest.railwayCategory,
      railwayCode: labTest.railwayCode,
      nabhPrice: labTest.nabhPrice,
      nonNabhPrice: labTest.nonNabhPrice,
      displaySequence: labTest.displaySequence,
      runNoType: labTest.runNoType,
      // specimen: labTest.specimen,
      interpretation: labTest.interpretation,
      // isSmsApplicable: labTest.isSmsApplicable,
      // isLisApplicable: labTest.isLisApplicable,
      // isValidForReporting: labTest.isValidForReporting,
      // taxApplicable: labTest.taxApplicable,
      // isOutsourcedTest: labTest.isOutsourcedTest,
      // hasNegativeResults: labTest.hasNegativeResults,
      // negativeResultText: labTest.negativeResultText,
      defaultOutsourceVendor: labTest.defaultOutsourceVendor,
      components: labTest.components,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log(form);
    try {
      const res = await fetch(
        `${environment.url}/api/lab/edit-new-lab-test/${id}`,
        {
          method: "PUT",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (res.ok) {
        fetchLabTests();
        setNotification(data.message);
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentItems = [...labTests]
  //   .reverse()
  //   .slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      // fetchLabTests();
    }
  };
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      // fetchLabTests();
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...filteredLabTests].slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLabTests.length / itemsPerPage);

  const exportToExcel = () => {
    if (filteredLabTests.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    // Extract all unique patient types dynamically
    const allPatientTypes = Array.from(
      new Set(
        filteredLabTests.flatMap((doc) =>
          doc.patientTypes.map((type) => type.patientTypeName)
        )
      )
    );

    // Prepare the data for Excel
    const data = filteredLabTests.map((lab, index) => {
      let row = {
        "#": index + 1,
        Name: lab.name || "-",
        Code: lab.code || "-",
        "Reporting Name": lab.reportingName || "-",
        Category: lab.labCategoryName || "-",
        Department: lab.departmentName || "-",
      };

      // Populate patient type columns dynamically
      allPatientTypes.forEach((type) => {
        const foundType = lab.patientTypes.find(
          (pt) => pt.patientTypeName === type
        );
        row[type] = foundType ? foundType.generalFees : "-";
      });

      const updatedRow = {
        ...row,
        "NABH Price": lab.nabhPrice,
        "NON-NABH Price": lab.nonNabhPrice,
      };
      return updatedRow;
    });

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lab Tests");

    // Save the file
    XLSX.writeFile(workbook, "Lab_Tests.xlsx");
  };

  const exportToCsv = () => {
    if (filteredLabTests.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    // Extract all unique patient types dynamically
    const allPatientTypes = Array.from(
      new Set(
        filteredLabTests.flatMap((doc) =>
          doc.patientTypes.map((type) => type.patientTypeName)
        )
      )
    );

    // Define CSV headers
    const csvHeaders = [
      "#",
      "Name",
      "Code",
      "Reporting Name",
      "Category",
      "Department",
      ...allPatientTypes,
      "NABH Price",
      "NON-NABH Price",
    ];

    // Prepare CSV data rows
    const csvRows = filteredLabTests.map((lab, index) => {
      return [
        index + 1,
        lab.name || "-",
        lab.code || "-",
        lab.lab.reportingName || "-",
        lab.labCategoryName || "-",
        lab.departmentName || "-",
        ...allPatientTypes.map((type) => {
          const foundType = lab.patientTypes.find(
            (pt) => pt.patientTypeName === type
          );
          return foundType ? foundType.generalFees : "-";
        }),
        lab.nabhPrice || "-",
        lab.nonNabhPrice || "-",
      ];
    });

    // Convert to CSV format
    let csvContent = [csvHeaders, ...csvRows]
      .map((row) => row.join(","))
      .join("\n");

    // Create and trigger CSV download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "lab_tests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPdf = () => {
    if (filteredLabTests.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const doc = new jsPDF();
    doc.text("Lab Tests", 14, 15);

    // Extract all unique patient types dynamically
    const allPatientTypes = Array.from(
      new Set(
        filteredLabTests.flatMap((doc) =>
          doc.patientTypes.map((type) => type.patientTypeName)
        )
      )
    );

    // Prepare table headers
    const tableHeaders = [
      "Name",
      "Code",
      "Category",
      "Department",
      ...allPatientTypes,
      "NABH Price",
      "NON-NABH Price",
    ];

    // Prepare table body
    const tableData = filteredLabTests.map((lab, index) => {
      return [
        lab.name || "-",
        lab.code || "-",
        lab.labCategoryName || "-",
        lab.departmentName || "-",
        ...allPatientTypes.map((type) => {
          const foundType = lab.patientTypes.find(
            (pt) => pt.patientTypeName === type
          );
          return foundType ? foundType.generalFees : "-";
        }),
        lab.nabhPrice || "-",
        lab.nonNabhPrice || "-",
      ];
    });

    // Generate table in PDF
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 20,
    });

    // Save PDF
    doc.save("lab_tests.pdf");
  };

  return (
    <>
      <div className="upper-lab">
        <h2>All Lab Tests</h2>
        <div style={{display: "flex", gap: "10px"}}>
        <input
            type="text"
            placeholder="Search by Name"
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ padding: "8px", margin:"auto 0" }}
          />
          <button
            onClick={handleFilterClick}
            style={{
              padding: "8px 15px",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: "500",
              width: "fit-content",
              margin:"auto 0"
            }}
          >
            Apply 
          </button>

        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={exportToExcel}
            className="export-btn"
            style={{
              width: "fit-content",
              height: "fit-content",
              margin: "auto 0",
              // marginRight: "80px",
              fontWeight: "500",
            }}
          >
            <FontAwesomeIcon icon={faFileExcel} /> Excel
          </button>
          <button
            onClick={exportToCsv}
            style={{
              width: "fit-content",
              height: "fit-content",
              margin: "auto 0",
              // marginRight: "80px",
              fontWeight: "500",
            }}
          >
            <FontAwesomeIcon icon={faFileCsv} /> CSV
          </button>
          <button
            onClick={exportToPdf}
            style={{
              width: "fit-content",
              height: "fit-content",
              margin: "auto 0",
              // marginRight: "80px",
              fontWeight: "500",
            }}
          >
            <FontAwesomeIcon icon={faFilePdf} /> PDF
          </button>
        </div>
        {user?.role === "admin" && (
          <button onClick={() => setIsModalOpen(true)}>Add Lab Test</button>
        )}
      </div>
      {loading ? (
        <Loader />
      ) : (
        <div className="lower-lab">
          <table className="lab-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Reporting Name</th>
                <th>Cateogry</th>
                <th>Display Sequence</th>
                <th>Patient Type</th>
                <th>General Fees</th>
                {/* <th>Railway Code</th> */}
                {/* <th>Nabh Price</th>
                <th>NonNabh Price</th> */}
                {user?.role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((test) => (
                  <tr key={test._id}>
                    <td>{test.name}</td>
                    <td>{test.reportingName}</td>
                    <td>{test.labCategoryName}</td>
                    <td>{test.displaySequence}</td>
                    <td>
                      <select
                        name="patientType"
                        value={"Select Patient Type"}
                        onChange={() => {}}
                        style={{ padding: "4px 10px", margin: "0" }}
                      >
                        {test.patientTypes.map((type) => (
                          <option
                            key={type.patientType}
                            value={type.patientType}
                          >
                            {`${type.patientTypeName} | ${type.generalFees}`}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {test.patientTypes.find(
                        (type) => type.patientTypeName === "General"
                      )?.generalFees || "-"}
                    </td>
                    {/* <td>{test.railwayCode || "N/A"}</td>
                    <td>{test.nabhPrice || "N/A"}</td>
                    <td>{test.nonNabhPrice || "N/A"}</td> */}
                    {user?.role === "admin" && (
                      <td
                        className="ipd-consumable-icon"
                        style={{ display: "flex", gap: "10px" }}
                      >
                        <FontAwesomeIcon
                          icon={faEdit}
                          onClick={() => handleEditing(test)}
                          title="Edit"
                          className="icon"
                        />
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() => handleDeleteLabTest(test._id)}
                          title="Delete"
                          className="icon"
                        />
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No Lab tests Available to Show
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

      <AddLabTestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddLabTest={handleAddLabTest}
        preloadedData={preloadedData}
        form={form}
        handleChange={handleChange}
        setForm={setForm}
      />

      <div className="edit-lab" ref={editRef}>
        <div className="modal-content">
          <button type="button" onClick={handleClose} className="opd-closeBtn">
            X
          </button>
          <h3>Edit Lab Test</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="form-row fg-group">
              <div className="form-group fg-group">
                <label>
                  Name:
                  <input
                    type="text"
                    name="name"
                    onChange={handleChange}
                    value={form.name}
                    required
                  />
                </label>
              </div>

              {/* Code */}
              <div className="form-group fg-group">
                <label>
                  Code:
                  <input
                    type="text"
                    name="code"
                    onChange={handleChange}
                    value={form.code}
                    required
                  />
                </label>
              </div>
            </div>
            <div className="form-row fg-group">
              {/* Reporting Name */}
              <div className="form-group fg-group">
                <label>
                  Reporting Name:
                  <input
                    type="text"
                    name="reportingName"
                    onChange={handleChange}
                    value={form.reportingName}
                    required
                  />
                </label>
              </div>

              {/* Report Template */}
              <div className="form-group fg-group" style={{ gap: "0" }}>
                <label>Report Template:</label>
                <AsyncSelect
                  cacheOptions
                  loadOptions={(inputValue) => {
                    return Promise.resolve(
                      preloadedData.reportingTemps.filter((supplier) =>
                        supplier.label
                          .toLowerCase()
                          .includes(inputValue.toLowerCase())
                      )
                    );
                  }}
                  defaultOptions={preloadedData.reportingTemps} // Show all options initially
                  value={preloadedData.reportingTemps.find(
                    (category) => category.value === form.reportTemp
                  )}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      reportTemp: e?.value || "",
                      reportTempName: e?.label || "",
                    });
                  }}
                  placeholder="Select Report Template"
                />
              </div>
            </div>
            <div className="form-row fg-group">
              {/* Lab Category */}
              <div className="form-group fg-group">
                <label>Lab Category:</label>
                <AsyncSelect
                  cacheOptions
                  loadOptions={(inputValue) => {
                    return Promise.resolve(
                      preloadedData.labCategories.filter((supplier) =>
                        supplier.label
                          .toLowerCase()
                          .includes(inputValue.toLowerCase())
                      )
                    );
                  }}
                  defaultOptions={preloadedData.labCategories}
                  value={preloadedData.labCategories.find(
                    (category) => category.value === form.labCategory
                  )}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      labCategory: e?.value || "",
                      labCategoryName: e?.label || "",
                    });
                  }}
                  placeholder="Select Lab Category"
                />
              </div>

              {/* Department */}
              <div className="form-group fg-group">
                <label>Department:</label>
                <AsyncSelect
                  cacheOptions
                  loadOptions={(inputValue) => {
                    return Promise.resolve(
                      preloadedData.departments.filter((supplier) =>
                        supplier.label
                          .toLowerCase()
                          .includes(inputValue.toLowerCase())
                      )
                    );
                  }}
                  defaultOptions={preloadedData.departments}
                  value={preloadedData.departments.find(
                    (category) => category.value === form.department
                  )}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      department: e?.value || "",
                      departmentName: e?.label || "",
                    });
                  }}
                  placeholder="Select Department"
                />
              </div>
            </div>
            {user?.role === "admin" && (
              <>
                {" "}
                <div
                  className="form-group fg-group"
                  style={{ marginTop: "15px" }}
                >
                  <label>Patient Types:</label>
                  {form.patientTypes.map((patientType, index) => (
                    <div
                      key={index}
                      className="row"
                      style={{
                        display: "flex",
                        alignItems: "base-line",
                        gap: "1rem",
                        marginBottom: "1rem",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ flex: 2 }}>
                        <label
                          style={{ display: "block", marginBottom: "0.5rem" }}
                        >
                          Patient Type:
                        </label>
                        <AsyncSelect
                          styles={{ width: "70%" }}
                          cacheOptions
                          loadOptions={(inputValue) => {
                            return Promise.resolve(
                              preloadedData.patientTypes
                                .filter(
                                  (i) =>
                                    i.label !==
                                    form.patientTypes.find(
                                      (it) => it.patientTypeName === i.label
                                    )?.patientTypeName
                                )
                                .filter((type) =>
                                  type.label
                                    .toLowerCase()
                                    .includes(inputValue.toLowerCase())
                                )
                            );
                          }}
                          defaultOptions={preloadedData.patientTypes.filter(
                            (i) =>
                              i.label !==
                              form.patientTypes.find(
                                (it) => it.patientTypeName === i.label
                              )?.patientTypeName
                          )}
                          value={
                            preloadedData.patientTypes.find(
                              (type) => type.value === patientType.type
                            ) ||
                            preloadedData.patientTypes.find(
                              (type) => type.value === patientType.patientType
                            )
                          }
                          onChange={(e) => {
                            const updatedPatientTypes = [...form.patientTypes];
                            updatedPatientTypes[index] = {
                              ...updatedPatientTypes[index],
                              patientType: e?.value || "",
                              patientTypeName: e?.label || "",
                            };
                            setForm({
                              ...form,
                              patientTypes: updatedPatientTypes,
                            });
                          }}
                          placeholder="Select Patient Type"
                        />
                      </div>
                      {form.patientTypes[
                        index
                      ]?.patientTypeName?.toLowerCase() !== "railway" && (
                        <div style={{ flex: 1, width: "10%" }}>
                          <label
                            style={{ display: "block", marginBottom: "0.5rem" }}
                          >
                            General Fees:
                          </label>
                          <input
                            type="number"
                            name={`patientTypes[${index}].fees`}
                            value={form.patientTypes[index].generalFees || ""}
                            onChange={(e) => {
                              const updatedPatientTypes = [
                                ...form.patientTypes,
                              ];
                              updatedPatientTypes[index] = {
                                ...updatedPatientTypes[index],
                                generalFees: e.target.value,
                              };
                              setForm({
                                ...form,
                                patientTypes: updatedPatientTypes,
                              });
                            }}
                            placeholder="Fees"
                            style={{
                              width: "100%",
                              padding: "0.5rem",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      )}
                      {index > 0 && (
                        <button
                          type="button"
                          style={{
                            padding: "0.5rem",
                            background: "#e74c3c",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            width: "5%",
                          }}
                          onClick={() => {
                            const updatedPatientTypes =
                              form.patientTypes.filter(
                                (_, idx) => idx !== index
                              );
                            setForm({
                              ...form,
                              patientTypes: updatedPatientTypes,
                            });
                          }}
                        >
                          X
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#3498db",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setForm({
                        ...form,
                        patientTypes: [
                          ...form.patientTypes,
                          {
                            patientType: null,
                            patientTypeName: "",
                            generalFees: 0,
                          },
                        ],
                      })
                    }
                  >
                    +
                  </button>
                </div>
                {form.patientTypes?.find(
                  (i) => i.patientTypeName?.toLowerCase() === "railway"
                ) && (
                  <>
                    <div className="form-row fg-group">
                      <div className="form-group fg-group">
                        <label>
                          Railway Code:
                          <input
                            type="text"
                            name="railwayCode"
                            onChange={handleChange}
                            value={form.railwayCode}
                          />
                        </label>
                      </div>

                      {/* NABH and Non-NABH Prices */}
                      <div className="form-group fg-group">
                        <label>
                          NABH Price:
                          <input
                            type="number"
                            name="nabhPrice"
                            onChange={handleChange}
                            value={form.nabhPrice || ""}
                          />
                        </label>
                      </div>
                      <div className="form-group fg-group">
                        <label>
                          Non-NABH Price:
                          <input
                            type="number"
                            name="nonNabhPrice"
                            onChange={handleChange}
                            value={form.nonNabhPrice || ""}
                          />
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <div className="form-row fg-group">
              <div className="form-group fg-group">
                <label>
                  Display Sequence:
                  <input
                    type="number"
                    name="displaySequence"
                    onChange={handleChange}
                    value={form.displaySequence}
                  />
                </label>
              </div>
              <div className="form-group fg-group">
                <label>
                  Run No. Type:
                  <select
                    name="runNoType"
                    onChange={handleChange}
                    value={form.runNoType}
                  >
                    <option value="normal">Normal</option>
                    <option value="cyto">Cyto</option>
                    <option value="histo">Histo</option>
                  </select>
                </label>
              </div>
            </div>
            {/* <div className="form-group fg-group">
            <label>
              Specimen:
              <input
                type="text"
                name="specimen"
                onChange={handleChange}
                value={form.specimen}
              />
            </label>
          </div> */}
            <div className="form-group fg-group">
              <label>
                Interpretation:
                <textarea
                  name="interpretation"
                  onChange={handleChange}
                  value={form.interpretation}
                />
              </label>
            </div>

            <label>
              Lab Test Components:
              {form.components.map((patientType, index) => (
                <div
                  key={index}
                  className="row"
                  style={{
                    display: "flex",
                    alignItems: "base-line",
                    gap: "1rem",
                    marginBottom: "1rem",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ flex: 2 }}>
                    <AsyncSelect
                      styles={{ width: "70%" }}
                      cacheOptions
                      loadOptions={(inputValue) => {
                        return Promise.resolve(
                          preloadedData.labTestComponents
                            .filter(
                              (i) =>
                                i.label !==
                                form.components.find((it) => it === i.label)
                            )
                            .filter((type) =>
                              type.label
                                .toLowerCase()
                                .includes(inputValue.toLowerCase())
                            )
                        );
                      }}
                      defaultOptions={preloadedData.labTestComponents.filter(
                        (i) =>
                          i.label !==
                          form.components.find((it) => it === i.label)
                      )}
                      value={preloadedData.labTestComponents.find(
                        (type) => type.value === patientType
                      )}
                      onChange={(e) => {
                        const updatedPatientTypes = [...form.components];
                        updatedPatientTypes[index] = e?.value || "";
                        setForm({ ...form, components: updatedPatientTypes });
                      }}
                      placeholder="Select Test Component"
                    />
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      style={{
                        padding: "0.5rem",
                        background: "#e74c3c",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        width: "5%",
                      }}
                      onClick={() => {
                        const updatedPatientTypes = form.components.filter(
                          (_, idx) => idx !== index
                        );
                        setForm({ ...form, components: updatedPatientTypes });
                      }}
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
            </label>
            <button
              type="button"
              style={{
                padding: "0.5rem 1rem",
                background: "#3498db",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() =>
                setForm({
                  ...form,
                  components: [...form.components, ""],
                })
              }
            >
              +
            </button>

            {/* Checkboxes */}
            {/* <div className="form-group fg-group">
              <label>
                <input
                  type="checkbox"
                  name="isSmsApplicable"
                  checked={form.isSmsApplicable}
                  onChange={handleChange}
                />
                SMS Applicable
              </label>
            </div>
            <div className="form-group fg-group">
              <label>
                <input
                  type="checkbox"
                  name="isLisApplicable"
                  checked={form.isLisApplicable}
                  onChange={handleChange}
                />
                LIS Applicable
              </label>
            </div>
            <div className="form-group fg-group">
              <label>
                <input
                  type="checkbox"
                  name="taxApplicable"
                  checked={form.taxApplicable}
                  onChange={handleChange}
                />
                Tax Applicable
              </label>
            </div>
            <div className="form-group fg-group">
              <label>
                <input
                  type="checkbox"
                  name="isOutsourcedTest"
                  checked={form.isOutsourcedTest}
                  onChange={handleChange}
                />
                Outsourced Test
              </label>
            </div> */}

            <button type="submit">Edit Lab Test</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddLabTest;
