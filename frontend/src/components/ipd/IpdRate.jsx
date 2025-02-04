import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";
import IpdRateModal from "./IpdRateModal.jsx";
import AsyncSelect from "react-select/async";
import Loader from "../Loader.jsx";
import { getUserDetails } from "../../../utlis/userDetails.js";
import * as XLSX from "xlsx"; // Import xlsx library
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables

const IpdRate = () => {
  const [ipdRates, setIpdRates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setNotification, user } = useContext(AppContext);
  const [form, setForm] = useState({
    roomId: "",
    name: "",
    department: "",
    departmentName: "",
    patientTypes: [
      {
        patientType: null,
        patientTypeName: "",
        generalFees: 0,
      },
    ],
    railwayCode: "",
    nabhPrice: "",
    nonNabhPrice: "",
  });
  const [id, setId] = useState("");
  const [patientTypes, setPatientTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [preloadedData, setPreloadedData] = useState({
    patientTypes: [],
  });
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRates, setFilteredRates] = useState([]);

  const editRef = useRef();

  useEffect(() => {
    fetchPatientTypes();
    fetchRooms();
    fetchIpdRates();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/admin/get-departments`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await response.json();
      setDepartments(data.departments);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };
  const handleDepartmentChange = (e) => {
    const selectedDepartmentId = e.target.value;
    const selectedDepartment = departments.find(
      (dept) => dept._id === selectedDepartmentId
    );
    setForm((prevData) => ({
      ...prevData,
      department: selectedDepartmentId,
      departmentName: selectedDepartment?.name,
    }));
  };

  const fetchIpdRates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/common/get-ipd-rate`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setIpdRates(data.ipdRates);
        setFilteredRates(data.ipdRates);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomInput = (e) => {
    const { value } = e.target;
    setForm((prevData) => ({
      ...prevData,
      name: value,
    }));
    if (value.length > 1) {
      const filtered = rooms.filter((room) =>
        room.roomNumber.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredRooms(filtered);
    } else {
      setFilteredRooms([]);
    }
  };

  const handleRoomSelect = (room) => {
    setForm((prevData) => ({
      ...prevData,
      roomId: room._id,
      name: room.roomNumber, // Ensure room number is set here
    }));
    setFilteredRooms([]);
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${environment.url}/api/ipd/get-rooms`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setRooms(data.rooms);
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
        // console.log("patient types: ", data);
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log("edited form:", form);
    try {
      const res = await fetch(
        `${environment.url}/api/common/edit-ipd-rate/${id}`,
        {
          method: "PUT",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (res.ok) {
        fetchIpdRates();
        setNotification(data.message);
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
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

  const handleClose = () => {
    editRef.current.style.display = "none";
  };

  const handleEditing = (rate) => {
    editRef.current.style.display = "flex";
    setId(rate._id);
    const selectedRoom = rooms.find((room) => room._id === rate.roomId);

    setForm({
      roomId: rate.roomId,
      name: selectedRoom ? selectedRoom.roomNumber : rate.name, // Use roomNumber as fallback
      patientTypes: rate.patientTypes,
      railwayCode: rate.railwayCode,
      nabhPrice: rate.nabhPrice,
      nonNabhPrice: rate.nonNabhPrice,
    });

    // Ensure room list is filtered to show the selected room
    setFilteredRooms(selectedRoom ? [selectedRoom] : []);
  };

  const handleDeleteRate = async (rateId) => {
    // console.log(rateId);
    try {
      const res = await fetch(
        `${environment.url}/api/common/delete-ipd-rate/${rateId}`,
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
        fetchIpdRates();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddIpd = async (ipdRate) => {
    // console.log("added ipdRate:", ipdRate);
    const userDetails = getUserDetails();
    const updatedForm = { ...ipdRate, ...userDetails };
    try {
      const res = await fetch(`${environment.url}/api/common/add-ipd-rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(updatedForm),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        fetchIpdRates();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = () => {
    if (searchQuery === "") {
      setFilteredRates(ipdRates); // If search query is empty, show all wings
    } else {
      const searchResults = ipdRates.filter((rate) =>
        rate.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRates(searchResults); // Set filtered wings based on search query
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...filteredRates]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRates.length / itemsPerPage);

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

  const exportToExcel = () => {
    if (filteredRates.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    // Extract all unique patient types dynamically
    const allPatientTypes = Array.from(
      new Set(
        filteredRates.flatMap((doc) =>
          doc.patientTypes.map((type) => type.patientTypeName)
        )
      )
    );

    // Prepare the data for Excel
    const data = filteredRates.map((rate, index) => {
      let row = {
        "#": index + 1,
        "Item Name": rate.name,
      };

      // Populate patient type columns dynamically
      allPatientTypes.forEach((type) => {
        const foundType = rate.patientTypes.find(
          (pt) => pt.patientTypeName === type
        );
        row[type] = foundType ? foundType.generalFees : "-";
      });

      const updatedRow = {
        ...row,
        "NABH Price": rate.nabhPrice || "-",
        "NON-NABH Price": rate.nonNabhPrice || "-",
      };
      return updatedRow;
    });

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "IPD Rates");

    // Save the file
    XLSX.writeFile(workbook, "ipd_rates.xlsx");
  };

  const exportToCsv = () => {
    if (filteredRates.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    // Extract all unique patient types dynamically
    const allPatientTypes = Array.from(
      new Set(
        filteredRates.flatMap((doc) =>
          doc.patientTypes.map((type) => type.patientTypeName)
        )
      )
    );

    // Define CSV headers
    const csvHeaders = [
      "#",
      "Item Name",
      ...allPatientTypes,
      "NABH Price",
      "NON-NABH Price",
    ];

    // Prepare CSV data rows
    const csvRows = filteredRates.map((rate, index) => {
      return [
        index + 1,
        rate.name,
        ...allPatientTypes.map((type) => {
          const foundType = rate.patientTypes.find(
            (pt) => pt.patientTypeName === type
          );
          return foundType ? foundType.generalFees : "-";
        }),
        rate.nabhPrice || "-",
        rate.nonNabhPrice || "-",
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
    link.setAttribute("download", "ipd_rates.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPdf = () => {
    if (filteredRates.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const doc = new jsPDF();
    doc.text("IPD Rate", 14, 15);

    // Extract all unique patient types dynamically
    const allPatientTypes = Array.from(
      new Set(
        filteredRates.flatMap((doc) =>
          doc.patientTypes.map((type) => type.patientTypeName)
        )
      )
    );

    // Prepare table headers
    const tableHeaders = [
      "#",
      "Item Name",
      ...allPatientTypes,
      "NABH Price",
      "NON-NABH Price",
    ];

    // Prepare table body
    const tableData = filteredRates.map((rate, index) => {
      return [
        index + 1,
        rate.name,
        ...allPatientTypes.map((type) => {
          const foundType = rate.patientTypes.find(
            (pt) => pt.patientTypeName === type
          );
          return foundType ? foundType.generalFees : "-";
        }),
        rate.nabhPrice || "-",
        rate.nonNabhPrice || "-",
      ];
    });

    // Generate table in PDF
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 20,
    });

    // Save PDF
    doc.save("ipd_rates.pdf");
  };

  return (
    <>
      <div className="upper-wing">
        <h2>Ipd Rate</h2>
        <div
          className="search-bar"
          style={{ display: "flex", gap: "20px", margin: "0" }}
        >
          <input
            type="text"
            placeholder="Search by Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ margin: "auto 0" }}
          />
          <button
            onClick={handleSearch}
            style={{ margin: "auto 0", width: "fit-content" }}
          >
            Search
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
          <button onClick={() => setIsModalOpen(true)}>Add IPD Rate</button>
        )}
      </div>
      {loading ? (
        <Loader />
      ) : (
        <div className="lower-wing">
          <table className="wing-table">
            <thead>
              <tr>
                <th>Room Name</th>
                <th>Patient Type</th>
                {/* <th>Railway Code</th> */}
                <th>General Fees</th>
                {/* <th>Nabh price</th>
                <th>nonNabh price</th> */}
                {user?.role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((rate) => (
                  <tr key={rate._id}>
                    <td>{rate.name}</td>
                    <td>
                      <select
                        name="patientType"
                        value={"Select Patient Type"}
                        onChange={() => {}}
                        style={{ padding: "4px 10px", margin: "0" }}
                      >
                        {rate.patientTypes.map((type) => (
                          <option
                            key={type.patientType}
                            value={type.patientType}
                          >
                            {`${type.patientTypeName} | ${type.generalFees}`}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* <td>{rate.railwayCode || "N/A"}</td> */}
                    <td>
                      {rate.patientTypes.find(
                        (type) => type.patientTypeName === "General"
                      )?.generalFees || "-"}
                    </td>
                    {/* <td>{rate.nabhPrice || "N/A"}</td>
                    <td>{rate.nonNabhPrice || "N/A"}</td> */}
                    {user?.role === "admin" && (
                      <td className="wing-btn" style={{ height: "49px" }}>
                        <FontAwesomeIcon
                          icon={faEdit}
                          onClick={() => handleEditing(rate)}
                          title="Edit"
                          className="icon"
                        />
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() => handleDeleteRate(rate._id)}
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
                    No IPD Rates Available to Show
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

      <IpdRateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddIpd={handleAddIpd}
        preloadedData={preloadedData}
        departments={departments}
      />

      <div className="edit-wing" ref={editRef}>
        <div
          className="modal-content"
          style={{ height: "70%", paddingTop: "10px" }}
        >
          <button type="button" onClick={handleClose} className="opd-closeBtn">
            X
          </button>
          <h3>Update Ipd Rate</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="form-row fg-group">
              <div className="form-group">
                <label>Room Name:</label>
                <input
                  className="form-input"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleRoomInput}
                  placeholder="Search Room by Name"
                  autoComplete="off"
                />
                {filteredRooms.length > 0 && (
                  <ul className="autocomplete-dropdown">
                    {filteredRooms.map((room) => (
                      <li
                        key={room._id}
                        onClick={() => handleRoomSelect(room)}
                        className="dropdown-item"
                      >
                        {room.roomNumber}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  value={form.department}
                  onChange={handleDepartmentChange}
                >
                  <option value="">Select Department</option>
                  {departments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group fg-group">
              <label>Patient Types:</label>
              {form?.patientTypes?.map((patientType, index) => (
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
                    <label style={{ display: "block", marginBottom: "0.9rem" }}>
                      Patient Type:
                    </label>
                    <AsyncSelect
                      styles={{ width: "70%" }}
                      cacheOptions
                      loadOptions={(inputValue, callback) => {
                        const selectedValues = form.patientTypes.map(
                          (pt) => pt.patientType
                        );

                        const filtered = preloadedData.patientTypes
                          .filter(
                            (type) => !selectedValues.includes(type.value)
                          ) // Exclude selected
                          .filter(
                            (type) =>
                              type.label
                                .toLowerCase()
                                .includes(inputValue.toLowerCase()) // Match search input
                          );

                        callback(filtered);
                      }}
                      defaultOptions={preloadedData.patientTypes.filter(
                        (type) =>
                          !form.patientTypes.some(
                            (pt) => pt.patientType === type.value
                          )
                      )}
                      value={preloadedData.patientTypes.find(
                        (type) => type.value === patientType.patientType
                      )}
                      onChange={(e) => {
                        const updatedPatientTypes = [...form.patientTypes];
                        updatedPatientTypes[index] = {
                          ...updatedPatientTypes[index],
                          patientType: e?.value || "",
                          patientTypeName: e?.label || "",
                        };
                        setForm({ ...form, patientTypes: updatedPatientTypes });
                      }}
                      placeholder="Select Patient Type"
                    />
                  </div>
                  {form.patientTypes[index]?.patientTypeName?.toLowerCase() !==
                    "railway" && (
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
                          const updatedPatientTypes = [...form.patientTypes];
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
                        padding: "7px 10px",
                        marginTop: "35px",
                        height: "fit-content",
                        background: "#e74c3c",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        width: "5%",
                      }}
                      onClick={() => {
                        const updatedPatientTypes = form.patientTypes.filter(
                          (_, idx) => idx !== index
                        );
                        setForm({ ...form, patientTypes: updatedPatientTypes });
                      }}
                    >
                      -
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
            {/* <div className="form-group fg-group">
            <label>
              Railway Category:
              <input
                type="text"
                name="railwayCategory"
                onChange={handleChange}
                value={form.railwayCategory}
              />
            </label>
          </div> */}
            {form.patientTypes?.find(
              (i) => i.patientTypeName?.toLowerCase() === "railway"
            ) && (
              <>
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
                      value={form.nabhPrice}
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
                      value={form.nonNabhPrice}
                    />
                  </label>
                </div>
              </>
            )}

            <button type="submit">Update Ipd Rate</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default IpdRate;
