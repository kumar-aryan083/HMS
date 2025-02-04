import React, { useContext, useEffect, useState } from "react";
import "./styles/SuppliesrList.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faEye,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faTrash,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import AddSupplier from "./AddSupplier";
import AddMedicine from "./AddMedicine";
import AddSupplierBill from "./AddSupplierBill";
import Loader from "../Loader";
import * as XLSX from "xlsx"; // Import xlsx library
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables
import { getUserDetails } from "../../../utlis/userDetails";

const SupplierBillList = ({ admissionId }) => {
  const { setNotification, user } = useContext(AppContext);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [assignedMedicines, setAssignedMedicines] = useState([]);
  const [isSupplierEditPopupOpen, setIsSupplierEditPopupOpen] = useState(false);
  const [editedMedicine, setEditedMedicine] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  // const [totalPages, setTotalPages] = useState(null);

  const toggleConsumablesPopup = () => {
    setIsAddSupplierOpen(!isAddSupplierOpen);
    fetchSuppliers();
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

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/inventory/get-supplier-bill`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            token: localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setAssignedMedicines(data.items);
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

  const handleNewSuppliers = () => {
    fetchSuppliers();
  };
  const handleDeleteSuppliers = async (medicineId) => {
    // console.log(medicineId);
    try {
      const res = await fetch(
        `${environment.url}/api/inventory/delete-supplier-bill/${medicineId}`,
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

  const openEditPopup = (medicine, isView = null) => {
    // console.log("Edit medicine:", medicine);
    setEditedMedicine(medicine);
    if (isView) {
      setIsViewOpen(true);
      return;
    }
    setIsSupplierEditPopupOpen(true);
  };

  const closeEditPopup = () => {
    setEditedMedicine(null);
    setIsSupplierEditPopupOpen(false);
  };

  const closeReadPopup = () => {
    setEditedMedicine(null);
    setIsViewOpen(false);
  };

  function removeFalsyValues(obj) {
    if (Array.isArray(obj)) {
      // Handle arrays: filter out falsy or empty objects
      return obj
        .map((item) => removeFalsyValues(item)) // Recursively clean each item
        .filter(
          (item) =>
            !(typeof item === "object" && Object.keys(item).length === 0) &&
            item
        ); // Remove empty objects and falsy items
    } else if (typeof obj === "object" && obj !== null) {
      // Handle objects: clean each key-value pair
      return Object.entries(obj).reduce((acc, [key, value]) => {
        const cleanedValue = removeFalsyValues(value); // Recursively clean value
        if (
          !(
            typeof cleanedValue === "object" &&
            Object.keys(cleanedValue).length === 0
          ) && // Skip empty objects
          cleanedValue
        ) {
          acc[key] = cleanedValue; // Keep valid key-value pairs
        }
        return acc;
      }, {});
    } else {
      // For primitives, return as-is
      return obj;
    }
  }

  function areObjectsEqualWithoutPayment(obj1, obj2) {
    // console.log("obj1", obj1);
    // console.log("obj2", obj2);
    // Helper function to deep compare two objects or arrays
    function deepEqual(a, b) {
      if (a === b) return true; // Direct match (primitives or reference equality)

      if (typeof a !== typeof b) return false; // Type mismatch

      if (
        typeof a === "object" &&
        typeof b === "object" &&
        a !== null &&
        b !== null
      ) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false; // Different number of keys

        // Check if all keys and values are equal
        for (const key of keysA) {
          if (!keysB.includes(key)) return false; // Key missing in `b`
          if (!deepEqual(a[key], b[key])) return false; // Value mismatch
        }
        return true;
      }

      return false; // If not objects, and not equal, return false
    }

    // Remove `payment` property from shallow copies of the objects
    const obj1Copy = { ...obj1 };
    const obj2Copy = { ...obj2 };
    delete obj1Copy.payment;
    delete obj2Copy.payment;

    // Perform deep comparison
    return deepEqual(obj1Copy, obj2Copy);
  }

  const handleUpdateSuppliers = async (updatedData, index) => {
    if (index === null) {
      try {
        // remove all the field thats are empty or null or undefince from updatedData at every level
        const newupdatedData = removeFalsyValues(updatedData);
        const userDetails = getUserDetails();
        const updatedForm = { ...newupdatedData, ...userDetails };
        // console.log("updatedForm", updatedForm);
        // console.log("full update");
        const res = await fetch(
          `${environment.url}/api/inventory/update-supplier-bill/${updatedData._id}`,
          {
            method: "PUT",
            headers: {
              "x-tenant-id": environment.tenantId,
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify(updatedForm),
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
    } else {
      if (
        updatedData.payment?.amount &&
        areObjectsEqualWithoutPayment(
          updatedData,
          assignedMedicines.find((med) => med._id === updatedData._id)
        )
      ) {
        try {
          // console.log("payment update", {
          //   billId: updatedData._id,
          //   payment: updatedData.payment,
          // });
          const res = await fetch(
            `${environment.url}/api/inventory/add-payment-to-supplier-bill`,
            {
              method: "POST",
              headers: {
                "x-tenant-id": environment.tenantId,
                "Content-Type": "application/json",
                token: localStorage.getItem("token"),
                "ngrok-skip-browser-warning": "true",
              },
              body: JSON.stringify({
                billId: updatedData._id,
                payment: updatedData.payment,
              }),
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
      } else {
        // console.log("full update N");
        try {
          // remove all the field thats are empty or null or undefince from updatedData at every level
          const newupdatedData = removeFalsyValues(updatedData);
          const userDetails = getUserDetails();
          const updatedForm = { ...newupdatedData, ...userDetails };
          // console.log("updatedForm", updatedForm);
          const res = await fetch(
            `${environment.url}/api/inventory/update-supplier-bill/${updatedData._id}`,
            {
              method: "PUT",
              headers: {
                "x-tenant-id": environment.tenantId,
                "Content-Type": "application/json",
                token: localStorage.getItem("token"),
              },
              body: JSON.stringify(updatedForm),
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
      }
    }
    // console.log("Updated medicine data:", updatedData);
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

  const exportToExcel = () => {
    if (assignedMedicines.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = assignedMedicines.map((med, index) => ({
      "#": index + 1 + (currentPage - 1) * itemsPerPage,
      "Supplier Name": med.supplierName || "N/A",
      "Bill Number": med.billNumber || "N/A",
      "Bill Date": med.billDate ? formatDateToDDMMYYYY(med.billDate) : "N/A",
      Amount: med.totalAmount ?? "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Supplier Bill List");
    XLSX.writeFile(workbook, "Supplier_Bill_List.xlsx");
  };

  const exportToCsv = () => {
    if (assignedMedicines.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = assignedMedicines.map((med, index) => ({
      "#": index + 1 + (currentPage - 1) * itemsPerPage,
      "Supplier Name": med.supplierName || "N/A",
      "Bill Number": med.billNumber || "N/A",
      "Bill Date": med.billDate ? formatDateToDDMMYYYY(med.billDate) : "N/A",
      Amount: med.totalAmount ?? "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Supplier Bill List");
    XLSX.writeFile(workbook, "Supplier_Bill_List.csv", { bookType: "csv" });
  };

  const exportToPdf = () => {
    if (assignedMedicines.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const pdf = new jsPDF();
    pdf.text("Supplier Bill List", 14, 10);

    const tableData = assignedMedicines.map((med, index) => [
      index + 1 + (currentPage - 1) * itemsPerPage,
      med.supplierName || "N/A",
      med.billNumber || "N/A",
      med.billDate ? formatDateToDDMMYYYY(med.billDate) : "N/A",
      med.totalAmount ?? "N/A",
    ]);

    pdf.autoTable({
      head: [["#", "Supplier Name", "Bill Number", "Bill Date", "Amount"]],
      body: tableData,
    });

    pdf.save("Supplier_Bill_List.pdf");
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...assignedMedicines].slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(assignedMedicines.length / itemsPerPage);

  return (
    <div className="pharmacy-list">
      <h2>Supplier Bills</h2>
      <div
        className="am-head"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
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
        <button onClick={toggleConsumablesPopup} className="pharmacy-add-btn">
          Add Bill
        </button>
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
              <th>Supplier Name</th>
              <th>Bill Number</th>
              <th>Bill Date</th>
              <th>Amount</th>
              {/* <th>Status</th> */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems && currentItems.length > 0 ? (
              currentItems.map((med, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{med.supplierName || "N/A"}</td>
                  <td>{med.billNumber ?? "N/A"}</td>
                  <td>{formatDateToDDMMYYYY(med.billDate) ?? "N/A"}</td>
                  <td>{med.totalAmount ?? "N/A"}</td>
                  {/* <td>{med.status ?? "N/A"}</td> */}
                  <td className="ipd-consumable-icons">
                    <FontAwesomeIcon
                      icon={faEye}
                      title="View"
                      className="consumable-icon"
                      onClick={() => openEditPopup(med, true)}
                      style={{ fontSize: "15px" }}
                    />
                    <FontAwesomeIcon
                      icon={faEdit}
                      title="Edit"
                      className="consumable-icon"
                      onClick={() => openEditPopup(med)}
                      style={{ fontSize: "15px" }}
                    />
                    {user?.role === "admin" && (
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        title="Delete"
                        className="consumable-icon"
                        onClick={() => handleDeleteSuppliers(med._id)}
                        style={{ fontSize: "15px" }}
                      />
                    )}
                  </td>
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
            <AddSupplierBill
              // admissionId={admissionId}
              toggleConsumablesPopup={toggleConsumablesPopup}
              // onAssign={handleNewConsumable}
            />
          </div>
        </div>
      )}

      {isViewOpen && (
        <div className="pharmacy-popup">
          <div className="pharmacy-popup-content">
            <button
              className="pharmacy-close-popup-btn"
              onClick={closeReadPopup}
            >
              X
            </button>
            <AddSupplierBill
              // admissionId={admissionId}
              medicine={editedMedicine}
              isView={"view"}
              onUpdate={handleUpdateSuppliers}
              onClose={closeReadPopup}
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
            <AddSupplierBill
              medicine={editedMedicine}
              isView={"edit"}
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

export default SupplierBillList;
