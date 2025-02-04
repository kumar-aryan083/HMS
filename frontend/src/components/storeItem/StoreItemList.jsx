import React, { useContext, useEffect, useRef, useState } from "react";
import "./styles/StoreItemList.css";
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
import AddStoreItem from "./AddStoreItem";
import Loader from "../Loader";
import * as XLSX from "xlsx"; // Import xlsx library
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables

const StoreItemList = () => {
  const { setNotification } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storeItems, setStoreItems] = useState([]);
  const [id, setId] = useState("");
  const [form, setForm] = useState({
    name: "",
    code: "",
    rate: "",
    gst: "",
    mrp: "",
    buffer: "",
    stockQuantity: "",
    category: "",
    categoryName: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const editRef = useRef();

  useEffect(() => {
    fetchStoreItems();
    fetchCategories();
  }, []);

  const fetchStoreItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/store/get-store-items`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setStoreItems(data.storeItems);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${environment.url}/api/store/get-categories`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setCategories(data.categories);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddStoreItem = async (storeItem) => {
    // console.log("added storeItem: ", storeItem);
    try {
      const res = await fetch(`${environment.url}/api/store/add-store-item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(storeItem),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        setStoreItems((prev) => [...prev, data.newStoreItem]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditing = (storeItem) => {
    // console.log(storeItem);
    editRef.current.style.display = "flex";
    setId(storeItem._id);
    setForm({
      name: storeItem.name,
      code: storeItem.code,
      rate: storeItem.rate,
      gst: storeItem.gst,
      mrp: storeItem.mrp,
      buffer: storeItem.buffer,
      stockQuantity: storeItem.stockQuantity,
      category: storeItem.category,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log("Edited store item", form);
    try {
      const res = await fetch(
        `${environment.url}/api/store/edit-store-item/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setStoreItems((prev) =>
          prev.map((exisiting) =>
            exisiting._id === data.udpatedStoreItem._id
              ? data.udpatedStoreItem
              : exisiting
          )
        );
        setNotification(data.message);
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteStoreItem = async (storeItemId) => {
    // console.log(storeItemId);
    try {
      const res = await fetch(
        `${environment.url}/api/store/delete-store-item/${storeItemId}`,
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
        setStoreItems((prev) =>
          prev.filter((item) => item._id !== data.storeItem._id)
        );
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      const selectedCategory = categories.find((cat) => cat._id === value);
      setForm({
        ...form,
        category: value,
        categoryName: selectedCategory ? selectedCategory.name : "",
      });
    } else {
      setForm({
        ...form,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleClose = () => {
    editRef.current.style.display = "none";
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
  const currentItems = [...storeItems]
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(storeItems.length / itemsPerPage);

  const exportToExcel = () => {
    if (storeItems.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = storeItems.map((item, index) => ({
      "#": index + 1,
      Name: item.name || "N/A",
      Code: item.code || "N/A",
      GST: item.gst || "N/A",
      Rate: item.rate || "N/A",
      MRP: item.mrp || "N/A",
      "Stock Quantity": item.stockQuantity || "N/A",
      Buffer: item.buffer || "N/A",
      Category: item.categoryName || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Store Items");
    XLSX.writeFile(workbook, "Store_Items.xlsx");
  };

  const exportToCsv = () => {
    if (storeItems.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = storeItems.map((item, index) => ({
      "#": index + 1,
      Name: item.name || "N/A",
      Code: item.code || "N/A",
      GST: item.gst || "N/A",
      Rate: item.rate || "N/A",
      MRP: item.mrp || "N/A",
      "Stock Quantity": item.stockQuantity || "N/A",
      Buffer: item.buffer || "N/A",
      Category: item.categoryName || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Store Items");
    XLSX.writeFile(workbook, "Store_Items.csv", { bookType: "csv" });
  };

  const exportToPdf = () => {
    if (storeItems.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const pdf = new jsPDF();
    pdf.text("Store Items List", 14, 10);

    const tableData = storeItems.map((item, index) => [
      index + 1,
      item.name || "N/A",
      item.code || "N/A",
      item.gst || "N/A",
      item.rate || "N/A",
      item.mrp || "N/A",
      item.stockQuantity || "N/A",
      item.buffer || "N/A",
      item.categoryName || "N/A",
    ]);

    pdf.autoTable({
      head: [
        [
          "#",
          "Name",
          "Code",
          "GST",
          "Rate",
          "MRP",
          "Stock Quantity",
          "Buffer",
          "Category",
        ],
      ],
      body: tableData,
    });

    pdf.save("Store_Items.pdf");
  };

  return (
    <div className="pharmacy-list">
      <h2>Store Items</h2>
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
        <button
          onClick={() => setIsModalOpen(true)}
          className="pharmacy-add-btn"
        >
          Add Store Items
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
              <th>Name</th>
              <th>Code</th>
              <th>GST</th>
              <th>Rate</th>
              <th>MRP</th>
              <th>StockQuantity</th>
              <th>Buffer</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems && currentItems.length > 0 ? (
              currentItems.map((store, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{store.name || "N/A"}</td>
                  <td>{store.code}</td>
                  <td>{store.gst}</td>
                  <td>{store.rate}</td>
                  <td>{store.mrp}</td>
                  <td>{store.stockQuantity}</td>
                  <td>{store.buffer}</td>
                  <td>{store.categoryName}</td>
                  <td
                    className="ipd-consumable-icons"
                    style={{ display: "flex", gap: "10px" }}
                  >
                    <FontAwesomeIcon
                      icon={faEdit}
                      title="Edit"
                      className="icon"
                      onClick={() => handleEditing(store)}
                    />
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      title="Delete"
                      className="icon"
                      onClick={() => handleDeleteStoreItem(store._id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-data">
                  No Store Items assigned yet.
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

      <AddStoreItem
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddStoreItem={handleAddStoreItem}
      />

      <div className="edit-wing" ref={editRef}>
        <div className="modal-content" style={{height:"70%", width: "50%"}}>
          <button type="button" onClick={handleClose} className="opd-closeBtn">
            X
          </button>
          <h3>Edit Store Item</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="form-row fg-group">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  onChange={handleChange}
                  value={form.name}
                  required
                />
              </div>
              <div className="form-group">
                <label>Code:</label>
                <input
                  type="text"
                  name="code"
                  onChange={handleChange}
                  value={form.code}
                />
              </div>
            </div>
            <div className="form-row fg-group">
              <div className="form-group">
                <label>Rate:</label>
                <input
                  type="number"
                  name="rate"
                  onChange={handleChange}
                  value={form.rate}
                />
              </div>
              <div className="form-group">
                <label>GST(%):</label>
                <input
                  type="text"
                  name="gst"
                  onChange={handleChange}
                  value={form.gst}
                />
              </div>
              <div className="form-group">
                <label>Stock Quantity:</label>
                <input
                  type="text"
                  name="stockQuantity"
                  onChange={handleChange}
                  value={form.stockQuantity}
                />
              </div>
            </div>
            <div className="form-row fg-group">
              <div className="form-group">
                <label>MRP:</label>
                <input
                  type="number"
                  name="mrp"
                  onChange={handleChange}
                  value={form.mrp}
                />
              </div>
              <div className="form-group">
                <label>Buffer:</label>
                <input
                  type="text"
                  name="buffer"
                  onChange={handleChange}
                  value={form.buffer}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  style={{ padding: "8px" }}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit">Update Store Item</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreItemList;
