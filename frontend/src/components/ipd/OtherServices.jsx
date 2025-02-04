import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../context/AppContext";
import PatientTypeModal from "./PatientTypeModal";
import { environment } from "../../../utlis/environment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import OtherServicesModal from "./OtherServicesModal";
import Loader from "../Loader";
import { getUserDetails } from "../../../utlis/userDetails";
import * as XLSX from "xlsx"; // Import xlsx library
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables

const OtherServices = () => {
  const { setNotification, user } = useContext(AppContext);
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState(false);
  const [form, setForm] = useState({
    name: "",
    pricePerUnit: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);

  const editRef = useRef();

  useEffect(() => {
    fetchOtherServices();
  }, []);

  const fetchOtherServices = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/common/get-other-services`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setServices(data.services);
        setFilteredServices(data.services);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOtherService = async (service) => {
    // console.log(service);
    const userDetails = getUserDetails();
    const updatedForm = { ...service, ...userDetails };
    try {
      const res = await fetch(
        `${environment.url}/api/common/add-other-service`,
        {
          method: "POST",
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
        fetchOtherServices();
        setIsModalOpen(false);
        setNotification(data.message);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification(data.message);
    }
  };

  const handleDeleteOtherService = async (serviceId) => {
    // console.log(serviceId);
    try {
      const res = await fetch(
        `${environment.url}/api/common/delete-other-service/${serviceId}`,
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
        setServices((prevServices) =>
          prevServices.filter(
            (service) => service._id !== data.deletedService._id
          )
        );
        setFilteredServices((prevServices) =>
          prevServices.filter(
            (service) => service._id !== data.deletedService._id
          )
        );
      }
    } catch (error) {
      console.log(error);
      setNotification(data.message);
    }
  };

  const handleClose = () => {
    editRef.current.style.display = "none";
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditing = (service) => {
    // console.log(service);
    editRef.current.style.display = "flex";
    setId(service._id);
    setForm({
      name: service.name,
      pricePerUnit: service.pricePerUnit,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log(form);
    try {
      const res = await fetch(
        `${environment.url}/api/common/edit-other-service/${id}`,
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
        setServices((prevService) =>
          prevService.map((service) =>
            service._id === id ? data.updatedType : service
          )
        );
        setFilteredServices((prevService) =>
          prevService.map((service) =>
            service._id === id ? data.updatedType : service
          )
        );
        setNotification(data.message);
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = () => {
    if (searchQuery === "") {
      setFilteredServices(services); // If search query is empty, show all wings
    } else {
      const searchResults = services.filter((service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(searchResults); // Set filtered wings based on search query
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...filteredServices]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

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
    if (filteredServices.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = filteredServices.map((service, index) => ({
      "#": index + 1,
      "Item Name": service.name || "-",
      "Price Per Unit": service.pricePerUnit || "-",
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Other_Services");

    // Save file
    XLSX.writeFile(workbook, "other_services.xlsx");
  };

  const exportToCsv = () => {
    if (filteredServices.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = filteredServices.map((service, index) => ({
      "#": index + 1,
      "Item Name": service.name || "-",
      "Price Per Unit": service.pricePerUnit || "-",
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Other_services");

    // Write workbook as CSV
    XLSX.writeFile(workbook, "other_services.csv", { bookType: "csv" });
  };

  const exportToPdf = () => {
    if (filteredServices.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const pdf = new jsPDF();
    const tableData = filteredServices.map((service, index) => [
      index + 1,
      service.name || "-",
      service.pricePerUnit || "-",
    ]);

    pdf.autoTable({
      head: [["#", "Item Name", "Price Per Unit"]],
      body: tableData,
    });

    pdf.save("other_services.pdf");
  };

  return (
    <>
      <div className="upper-wing">
        <h2>Other Services</h2>
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
          <button onClick={() => setIsModalOpen(true)}>
            Add Other Service
          </button>
        )}
      </div>
      {loading ? (
        <Loader />
      ) : (
        <div className="lower-wing">
          <table className="wing-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price Per Unit</th>
                {user?.role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((service) => (
                  <tr key={service._id}>
                    <td>{service.name}</td>
                    <td>{service.pricePerUnit}</td>
                    {user?.role === "admin" && (
                      <td className="wing-btn">
                        <FontAwesomeIcon
                          icon={faEdit}
                          onClick={() => handleEditing(service)}
                          title="Edit"
                          className="icon"
                        />
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() => handleDeleteOtherService(service._id)}
                          title="Delete"
                          className="icon"
                        />
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No Patient Type Available to Show
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

      <OtherServicesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddOtherServices={handleAddOtherService}
      />

      <div className="edit-wing" ref={editRef}>
        <div
          className="modal-content"
          style={{ width: "400px", height: "52%", paddingTop: "10px" }}
        >
          <button type="button" onClick={handleClose} className="opd-closeBtn">
            X
          </button>
          <h3>Edit Other Service</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="form-group">
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  onChange={handleChange}
                  value={form.name}
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Price Per Unit:
                <input
                  type="Number"
                  name="pricePerUnit"
                  onChange={handleChange}
                  value={form.pricePerUnit}
                />
              </label>
            </div>

            <button type="submit">Update Other Service</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default OtherServices;
