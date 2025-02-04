import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../context/AppContext";
import { environment } from "../../utlis/environment";
import Loader from "./Loader";
import * as XLSX from "xlsx"; // Import xlsx library
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "../../utlis/userDetails";
import AddAdditonalService from "./AddAdditionalService";
import AddBirthCertificate from "./AddBirthCertificate";

const BirthCertificates = () => {
  const { setNotification, user } = useContext(AppContext);
  const [id, setId] = useState(false);
  const [form, setForm] = useState({
    name: "",
    generalFees: "",
  });
  const [additionalServices, setAdditionalServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const nav = useNavigate();
  const editRef = useRef();

    useEffect(() => {
      if (!user || (user.role !== "admin")) {
        setNotification("You are not authorised to access additional services");
        nav("/additional-services/service-bill");
      }
    }, [user, nav, setNotification]);

  useEffect(() => {
    document.title = "Birth Certificates | HMS";
    if (editRef.current) {
      editRef.current.style.display = "none";
    }
    fetchAdditionalServices();
  }, []);

  const fetchAdditionalServices = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${environment.url}/api/additional-services/get-additional-services`,
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
      // console.log("additional services", data);
      setAdditionalServices(data.items);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    // console.log(serviceId);
    try {
      const res = await fetch(
        `${environment.url}/api/additional-services/delete-additional-service/${serviceId}`,
        {
          method: "DELETE",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setAdditionalServices((prev) =>
          prev.filter((service) => service._id !== data.data._id)
        );
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

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleEditing = (service) => {
    // console.log(service);
    editRef.current.style.display = "flex";
    setId(service._id);
    setForm({
      name: service.name,
      generalFees: service.generalFees,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log("edited department", form);
    const userDetails = getUserDetails();
    const updatedForm = { ...form, ...userDetails };
    // console.log("updated additional service:", updatedForm);
    try {
      const res = await fetch(
        `${environment.url}/api/additional-services/update-additional-service/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(updatedForm),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setAdditionalServices((prev) =>
          prev.map((service) =>
            service._id === data.data._id ? data.data : service
          )
        );
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddCertificate = async (birth) => {
    //  console.log("added services:", services);
    const userDetails = getUserDetails();
    const updatedForm = { ...birth, ...userDetails };
    console.log("birth entry:", updatedForm);
    // try {
    //   const res = await fetch(
    //     `${environment.url}/api/additional-services/add-additional-service`,
    //     {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //         token: localStorage.getItem("token"),
    //       },
    //       body: JSON.stringify(updatedForm),
    //     }
    //   );
    //   const data = await res.json();
    //   if (res.ok) {
    //     setNotification(data.message);
    //     setAdditionalServices((prev) => [...prev, data.data]);
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...additionalServices].slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(additionalServices.length / itemsPerPage);

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
      <div className="full-doctor-list" style={{ margin: "20px 70px" }}>
        <div className="upper-wing">
          <h2>Birth Certificates</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="add-consumable-btn"
          >
            Add Entry
          </button>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className="lower-wing">
            <table className="wing-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>General Fees</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems?.length > 0 ? (
                  currentItems.map((service, index) => (
                    <tr key={service._id}>
                      <td>{index + 1}</td>
                      <td>{service.name}</td>
                      <td>{service.generalFees}</td>
                      <td className="wing-btn">
                        <FontAwesomeIcon
                          icon={faEdit}
                          onClick={() => handleEditing(service)}
                          title="Edit"
                          className="icon"
                        />
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() => handleDeleteService(service._id)}
                          title="Delete"
                          className="icon"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No Departments Available to Show
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

      <div
        className="department-modal-container edit-department-modal"
        ref={editRef}
      >
        <div className="department-modal-content">
          <button
            type="button"
            onClick={handleClose}
            className="department-modal-close-btn"
          >
            X
          </button>
          <h3 className="department-modal-title">Edit Service</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="form-row fg-group">
              <div className="form-group">
                <label>Name:</label>
                <input
                  className="form-input"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Service Name"
                />
              </div>
              <div className="form-group">
                <label>General Fees:</label>
                <input
                  className="form-input"
                  type="text"
                  name="generalFees"
                  value={form.generalFees}
                  onChange={handleChange}
                  placeholder="General Fees"
                />
              </div>
            </div>

            <button type="submit" className="department-modal-submit-btn">
              Update Service
            </button>
          </form>
        </div>
      </div>

      {isModalOpen && (
        <div className="staff-modal-overlay">
          <div>
            <button
              className="staff-modal-close-btn"
              onClick={handleModalClose}
            >
              X
            </button>
            <AddBirthCertificate
              onClose={handleModalClose}
              onAddCertificate={handleAddCertificate}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default BirthCertificates;
