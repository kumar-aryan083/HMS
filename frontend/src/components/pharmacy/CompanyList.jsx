import React, { useContext, useEffect, useState } from "react";
import "./styles/SuppliesrList.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import AddSupplier from "./AddSupplier";
import AddCompany from "./AddCompany";
import Loader from "../Loader";
// import Consumables from "./Consumables";
// import EditConsumablePopup from "./EditConsumablePopup";

const CompanyList = ({ admissionId }) => {
  const { setNotification, user } = useContext(AppContext);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [assignedMedicines, setAssignedMedicines] = useState([]);
  const [isSupplierEditPopupOpen, setIsSupplierEditPopupOpen] = useState(false);
  const [editedMedicine, setEditedMedicine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(null);

  const toggleConsumablesPopup = () => {
    fetchSuppliers();
    setIsAddSupplierOpen(!isAddSupplierOpen);
  };

  useEffect(() => {
    fetchSuppliers();
  }, [currentPage, itemsPerPage]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/pharmacy/get-companies?page=${currentPage}&limit=${itemsPerPage}`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setAssignedMedicines(data.items);
        setTotalPages(data.totalPages);
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
        `${environment.url}/api/pharmacy/delete-company/${medicineId}`,
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
        `${environment.url}/api/pharmacy/edit-company/${updatedData._id}`,
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

  return (
    <div className="pharmacy-list">
      <h2>Company</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        {user?.role === "admin" && (
          <button onClick={toggleConsumablesPopup} className="pharmacy-add-btn">
            Assign Company
          </button>
        )}
      </div>
      <hr className="am-h-line" />

      {loading ? (
        <Loader />
      ) : (
        <table className="pharmacy-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Contact No.</th>
              <th>Address</th>
              <th>Email</th>
              {user?.role === "admin" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {assignedMedicines && assignedMedicines.length > 0 ? (
              assignedMedicines.map((med, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{med.name || "N/A"}</td>
                  <td>{med.contactNumber}</td>
                  <td>{med.contactAddress}</td>
                  <td>{med.email}</td>

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
                  No Company assigned yet.
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
            <AddCompany
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
            <AddCompany
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

export default CompanyList;
