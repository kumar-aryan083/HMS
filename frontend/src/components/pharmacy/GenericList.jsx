import React, { useContext, useEffect, useState } from "react";
import "./styles/SuppliesrList.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import AddSupplier from "./AddSupplier";
// import Consumables from "./Consumables";
// import EditConsumablePopup from "./EditConsumablePopup";

const GenericList = ({ admissionId }) => {
  const { setNotification } = useContext(AppContext);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [assignedMedicines, setAssignedMedicines] = useState([]);
  const [isSupplierEditPopupOpen, setIsSupplierEditPopupOpen] = useState(false);
  const [editedMedicine, setEditedMedicine] = useState(null);

  const toggleConsumablesPopup = () => setIsAddSupplierOpen(!isAddSupplierOpen);

  useEffect(() => {
    // fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/get-consumables`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setAssignedMedicines(data.consumables);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNewSuppliers = () => {
    fetchSuppliers();
  };
  const handleDeleteSuppliers = async (medicineId) => {
    // console.log(medicineId);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/delete-consumable/${medicineId}`,
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
        fetchIpdConsumables();
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
        `${environment.url}/api/ipd/${admissionId}/edit-consumable/${updatedData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(updatedData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        fetchIpdConsumables();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  return (
    <div className="consumable-list">
      <h2>Generic</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button onClick={toggleConsumablesPopup} className="add-consumable-btn">
          Assign Generic
        </button>
      </div>
      <hr className="am-h-line" />

      {/* Render the medications in a professional table */}
      <table className="consumable-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Contact No.</th>
            <th>GST Number</th>
            <th>PAN Number</th>
            <th>Company Name</th>
          </tr>
        </thead>
        <tbody>
          {assignedMedicines && assignedMedicines.length > 0 ? (
            assignedMedicines.map((med, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{med.type || "N/A"}</td>
                <td>{med.name}</td>
                <td>{med.dosage}</td>
                <td>{med.doctor}</td>

                <td className="ipd-consumable-icons">
                  <FontAwesomeIcon
                    icon={faEdit}
                    title="Edit"
                    className="consumable-icon"
                    onClick={() => openEditPopup(med)}
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    title="Delete"
                    className="consumable-icon"
                    onClick={() => handleDeleteConsumable(med._id)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-data">
                No Generic assigned yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Popup rendering */}
      {isAddSupplierOpen && (
        <div className="consumable-popup">
          <div className="consumable-popup-content">
            <button
              className="consumable-close-popup-btn"
              onClick={toggleConsumablesPopup}
            >
              X
            </button>
            <AddSupplier
            // admissionId={admissionId}
            // toggleConsumablesPopup={toggleConsumablesPopup}
            // onAssign={handleNewConsumable}
            />
          </div>
        </div>
      )}

      {/* {isMedEditPopupOpen && (
        <EditConsumablePopup
          medicine={editedMedicine}
          onClose={closeEditPopup}
          onUpdate={handleUpdateMedicine}
        />
      )} */}
    </div>
  );
};

export default GenericList;
