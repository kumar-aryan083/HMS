import React, { useContext, useEffect, useState } from "react";
import "./styles/SuppliesrList.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faTrash,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import AddSupplier from "./AddSupplier";
import AddMedicine from "./AddMedicine";
import Loader from "../Loader";
import * as XLSX from "xlsx"; // Import xlsx library
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables

const MedicineList = ({ admissionId }) => {
  const { setNotification, user } = useContext(AppContext);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [assignedMedicines, setAssignedMedicines] = useState([]);
  const [isSupplierEditPopupOpen, setIsSupplierEditPopupOpen] = useState(false);
  const [editedMedicine, setEditedMedicine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchText, setSearchText] = useState("");
  const [filteredMedicines, setFilteredMedicines] = useState([]); 
  // const [totalPages, setTotalPages] = useState(null);

  const toggleConsumablesPopup = () => {
    setIsAddSupplierOpen(!isAddSupplierOpen);
    fetchSuppliers();
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/pharmacy/get-medicines`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setAssignedMedicines(data.items);
        setFilteredMedicines(data.items);
        // setTotalPages(data.totalPages);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleApplyFilter = () => {
    const filteredData = assignedMedicines.filter((medicine) =>
      medicine.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredMedicines(filteredData);
  };

  const handleNewSuppliers = () => {
    fetchSuppliers();
  };
  const handleDeleteSuppliers = async (medicineId) => {
    // console.log(medicineId);
    try {
      const res = await fetch(
        `${environment.url}/api/pharmacy/delete-medicine/${medicineId}`,
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
        fetchSuppliers();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  const openEditPopup = (medicine) => {
    setEditedMedicine(medicine);
    setIsSupplierEditPopupOpen(true);
  };

  const closeEditPopup = () => {
    setEditedMedicine(null);
    setIsSupplierEditPopupOpen(false);
  };

  const handleUpdateSuppliers = async (updatedData) => {
    // console.log("Updated medicine data:", updatedData);
    try {
      const res = await fetch(
        `${environment.url}/api/pharmacy/edit-medicine/${updatedData._id}`,
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
        fetchSuppliers();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...filteredMedicines].slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);

  const exportToExcel = () => {
    if (filteredMedicines.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = filteredMedicines.map((med, index) => ({
      "#": index + 1 + (currentPage - 1) * 20,
      Name: med.name || "N/A",
      Category: med.categoryName || "N/A",
      "Batch Number": med.batchNumber || "N/A",
      "Company Name": med.companyName || "N/A",
      "Price Per Unit": med.pricePerUnit || "N/A",
      "Stock Quantity": med.stockQuantity || "N/A",
      "Expiry Date": med.expiryDate || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Medicine List");
    XLSX.writeFile(workbook, "Medicine_List.xlsx");
  };

  const exportToCsv = () => {
    if (filteredMedicines.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = filteredMedicines.map((med, index) => ({
      "#": index + 1 + (currentPage - 1) * 20,
      Name: med.name || "N/A",
      Category: med.categoryName || "N/A",
      "Batch Number": med.batchNumber || "N/A",
      "Company Name": med.companyName || "N/A",
      "Price Per Unit": med.pricePerUnit || "N/A",
      "Stock Quantity": med.stockQuantity || "N/A",
      "Expiry Date": med.expiryDate || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Medicine List");
    XLSX.writeFile(workbook, "Medicine_List.csv", { bookType: "csv" });
  };

  const exportToPdf = () => {
    if (filteredMedicines.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const pdf = new jsPDF();
    pdf.text("Medicine List", 14, 10);

    const tableData = filteredMedicines.map((med, index) => [
      index + 1 + (currentPage - 1) * 20,
      med.name || "N/A",
      med.categoryName || "N/A",
      med.batchNumber || "N/A",
      med.companyName || "N/A",
      med.pricePerUnit || "N/A",
      med.stockQuantity || "N/A",
      med.expiryDate || "N/A",
    ]);

    pdf.autoTable({
      head: [
        [
          "#",
          "Name",
          "Category",
          "Batch Number",
          "Company Name",
          "Price Per Unit",
          "Stock Quantity",
          "Expiry Date",
        ],
      ],
      body: tableData,
    });

    pdf.save("Medicine_List.pdf");
  };

  return (
    <div className="pharmacy-list">
      <h2>Medicines</h2>
      <div
        className="am-head"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)} // Update the search text
            placeholder="Search Medicine Name"
            style={{
              borderRadius: "4px",
              margin:"auto 0"
            }}
          />
          <button
            onClick={handleApplyFilter}
            className="apply-filter-btn"
            style={{
              height: "fit-content",
              width: "fit-content",
              fontWeight: "500",
              borderRadius: "5px",
              margin: "auto 0",
              padding: "10px",
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
        {/* Button to open the popup */}
        {user?.role === "admin" && (
          <button onClick={toggleConsumablesPopup} className="pharmacy-add-btn">
            Add Medicine
          </button>
        )}
      </div>
      <hr className="am-h-line" />

      {/* Render the medications in a professional table */}
      {loading ? (
        <Loader />
      ) : (
        <table className="pharmacy-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Category</th>
              <th>Batch Number</th>
              <th>Company Name</th>
              <th>Price Per Unit</th>
              <th>Stock Quantity</th>
              <th>Expiry Date</th>
              {user?.role === "admin" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems && currentItems.length > 0 ? (
              currentItems.map((med, index) => (
                <tr key={index}>
                  <td>{index + 1 + (currentPage - 1) * 20}</td>
                  <td>{med.name || "N/A"}</td>
                  <td>{med.categoryName ?? "N/A"}</td>
                  <td>{med.batchNumber ?? "N/A"}</td>
                  <td>{med.companyName ?? "N/A"}</td>
                  <td>{med.pricePerUnit ?? "N/A"}</td>
                  <td>{med.stockQuantity ?? "N/A"}</td>
                  <td>{med.expiryDate ?? "N/A"}</td>
                  {user?.role === "admin" && (
                    <td className="ipd-consumable-icons">
                      <FontAwesomeIcon
                        icon={faEdit}
                        title="Edit"
                        className="consumable-icon"
                        onClick={() => openEditPopup(med)}
                        style={{ fontSize: "15px" }}
                      />
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        title="Delete"
                        className="consumable-icon"
                        onClick={() => handleDeleteSuppliers(med._id)}
                        style={{ fontSize: "15px" }}
                      />
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No medicine assigned yet.
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
      {isAddSupplierOpen && (
        <div className="pharmacy-popup">
          <div className="pharmacy-popup-content">
            <button
              className="pharmacy-close-popup-btn"
              onClick={toggleConsumablesPopup}
            >
              X
            </button>
            <AddMedicine
              // admissionId={admissionId}
              toggleConsumablesPopup={toggleConsumablesPopup}
              isEdit={false}
            />
          </div>
        </div>
      )}

      {isSupplierEditPopupOpen && (
        <div className="pharmacy-popup">
          <div className="pharmacy-popup-content">
            <button
              className="pharmacy-close-popup-btn"
              onClick={closeEditPopup}
            >
              X
            </button>
            <AddMedicine
              medicine={editedMedicine}
              onClose={closeEditPopup}
              onUpdate={handleUpdateSuppliers}
              isEdit={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineList;
