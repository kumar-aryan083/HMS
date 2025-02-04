import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrashAlt,
  faEye,
  faPrint,
  faMoneyBillWave,
  faTimes,
  faFilePdf,
  faFileCsv,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";
import { useReactToPrint } from "react-to-print";
import Loader from "../Loader.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";
import AddLabBilling from "../laboratory/AddLabBilling.jsx";
import EditLabBilling from "../laboratory/EditLabBilling.jsx";
import LabBillingPrint from "../laboratory/LabBillingPrint.jsx";
import AddStoreBilling from "./AddStoreBilling.jsx";
import EditStoreBilling from "./EditStoreBilling.jsx";
import StoreBillingPrint from "./StoreBillingPrint.jsx";
import { getUserDetails } from "../../../utlis/userDetails.js";
import * as XLSX from "xlsx"; // Import xlsx library
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables

const StoreBillings = () => {
  const { setNotification, user } = useContext(AppContext);
  const [billings, setBillings] = useState([]);
  const [filteredBillings, setFilteredBillings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [remainingPrice, setRemainingPrice] = useState(0);
  const [patientDetails, setPatientDetails] = useState({});
  const [patientItem, setPatientItem] = useState({});
  const [newItems, setNewItems] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [customPaymentDetails, setCustomPaymentDetails] = useState({
    billId: "",
    paymentAmount: "",
    paymentType: "cash",
    transactionId: "",
    remainingDues: 0,
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  // const [totalPages, setTotalPages] = useState(null);
  const [billNumberInput, setBillNumberInput] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");
  const [billNumberFilter, setBillNumberFilter] = useState("");
  const [patientNameFilter, setPatientNameFilter] = useState("");
  const [appliedPaymentFilter, setAppliedPaymentFilter] = useState("All");
  const [totalAmount, setTotalAmount] = useState("All");
  const [startDate, setStartDate] = useState("2024-11-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const documentRef = useRef();
  const newPrintRef = useRef();

  const printBill = useReactToPrint({
    contentRef: documentRef,
  });

  const newPrint = useReactToPrint({
    contentRef: newPrintRef,
  });

  const calculateTotals = (items) => {
    let total = 0;
    let discount = 0;
    let remaining = 0;

    items?.forEach((bill) => {
      total += bill?.grandTotals?.totalCharge || 0;
      discount += bill?.grandTotals?.totalDiscount || 0;
      remaining += bill?.totalDiscounted || 0;
    });

    setTotalPrice(total);
    setTotalDiscount(discount);
    setRemainingPrice(remaining);
  };

  const handleSearch = () => {
    const filteredBillings = billings.filter((billing) => {
      const matchesBillNumber = billNumberFilter
        ? billing.purchaseOrderNumber.toString().includes(billNumberFilter)
        : true;

      const matchesPaymentMethod =
        paymentMethodFilter === "All"
          ? true
          : billing.paymentInfo.paymentType.toLowerCase() ===
            paymentMethodFilter.toLowerCase();

      return matchesBillNumber && matchesPaymentMethod;
    });

    // Update the displayed data with the filteredBillings
    setFilteredBillings(filteredBillings);
  };

  // const filteredBillings = billings.filter((billing) => {
  //   const matchesBillNumber = billNumberFilter
  //     ? billing.billNumber.toString().includes(billNumberFilter)
  //     : true;

  //   const matchesPatientName = patientNameFilter
  //     ? billing.patientName
  //         .toLowerCase()
  //         .includes(patientNameFilter.toLowerCase())
  //     : true;

  //   const matchesPaymentMethod =
  //     paymentMethodFilter === "All"
  //       ? true
  //       : billing.paymentInfo.paymentType.toLowerCase() ===
  //         paymentMethodFilter.toLowerCase(); // Updated key name

  //   return matchesBillNumber && matchesPatientName && matchesPaymentMethod;
  // });

  useEffect(() => {
    fetchStoreBillings();
  }, []);

  const fetchData = async () => {
    // console.log("fetchData");
    fetchStoreBillings();
  };

  const fetchStoreBillings = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/store/get-store-vendor-bills?startDate=${startDate}&endDate=${endDate}`,
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
        // console.log("bills to render for lab", data);
        setBillings(data.storeVendorBills);
        setFilteredBillings(data.storeVendorBills);
        // setTotalPages(data.totalPages);
        setTotalAmount(data.totalAmount);
        // calculateTotals(data.storeVendorBills);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBilling = async (billing) => {
    const userDetails = getUserDetails();
    const updatedForm = { ...billing, ...userDetails };
    // console.log("store bill going to backend", updatedForm);
    try {
      const res = await fetch(
        `${environment.url}/api/store/add-store-vendor-bill`,
        {
          method: "POST",
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
        // console.log(data);
        setNotification(data.message);
        setIsModalOpen(false);
        fetchStoreBillings();
        // setBillings((prevBillings) => [...prevBillings, data.newBill]);
        // setNewItems((prevItems) => [...(prevItems || []), data.newItem]);
        // calculateTotals([...billings, data.newItem]);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteBilling = async (billingId) => {
    // console.log(billingId);
    try {
      const res = await fetch(
        `${environment.url}/api/store/delete-store-vendor-bill/${billingId}`,
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
        // Remove the deleted billing from the state
        setFilteredBillings((prevBillings) => {
          const updatedBillings = prevBillings.filter(
            (bill) => bill._id !== data.deleted._id
          );
          // Recalculate totals with the updated billings
          //   calculateTotals(updatedBillings);
          return updatedBillings;
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPatientDetails = async (patientId) => {
    // console.log("patientId:", patientId);
    try {
      const res = await fetch(
        `${environment.url}/api/patient/get-patient-by-id/${patientId}`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log("patient data for lab print", data);
        setPatientDetails(data.patient);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePrint = (bill) => {
    // console.log("bill", bill)
    // fetchPatientDetails(bill.patientId);
    // console.log("patient details  ", patientDetails);
    setPatientItem(bill);
    setTimeout(() => {
      printBill();
    }, 300);
  };

  const handlePrint2 = async () => {
    // console.log(bill);
    newPrint();
  };

  const handleView = (bill) => {
    setSelectedBill(bill);
    setIsViewModalOpen(true);
  };

  const handleCloseView = () => {
    setIsViewModalOpen(false);
  };

  const handleEditing = (bill) => {
    // setId(bill._id);
    // console.log(bill);
    setSelectedBill(bill);
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
  };

  const handleEditSubmit = async (bill) => {
    // e.preventDefault();
    const userDetails = getUserDetails();
    const updatedForm = { ...bill, ...userDetails };
    // console.log("edited store bill for vendor", updatedForm);
    try {
      const res = await fetch(
        `${environment.url}/api/store/update-store-vendor-bill/${selectedBill._id}`,
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
        setFilteredBillings((prevBillings) =>
          prevBillings.map((existingBill) =>
            existingBill._id === data.updatedBill._id
              ? data.updatedBill
              : existingBill
          )
        );

        // Recalculate totals after updating state
        const updatedBillings = billings.map((existingBill) =>
          existingBill._id === data.updatedBill._id
            ? data.updatedBill
            : existingBill
        );
        calculateTotals(updatedBillings);
        setIsEditModalOpen(false);
        setNotification(data.message);
        handleCloseEdit();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setCustomPaymentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentClick = (bill) => {
    setSelectedBill(bill);
    setCustomPaymentDetails({
      billId: bill._id,
      paymentAmount: "",
      paymentType: "cash",
      transactionId: "",
      remainingDues: bill.grandRemainingDues,
    });
    setIsPaymentModalOpen(true);
  };

  function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);

    if (isNaN(date)) {
      throw new Error("Invalid date");
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${day}-${month}-${year}`;
  }

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
  const currentItems = [...filteredBillings]
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBillings.length / itemsPerPage);

  const exportToExcel = () => {
    if (filteredBillings.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = filteredBillings.map((bill, index) => ({
      "#": index + 1,
      "Purchase Order": bill.purchaseOrderNumber || "N/A",
      Vendor: bill.vendorName || "N/A",
      "Total Items": bill.items.length || "N/A",
      "Total Amount": bill.paymentInfo.paymentAmount.toFixed(2) || "N/A",
      "Payment Type": bill.paymentInfo?.paymentType || "N/A",
      Date: formatDateToDDMMYYYY(bill.date) || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Store Billings");
    XLSX.writeFile(workbook, "Store_Billings.xlsx");
  };

  const exportToCsv = () => {
    if (filteredBillings.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = filteredBillings.map((bill, index) => ({
      "#": index + 1,
      "Purchase Order": bill.purchaseOrderNumber || "N/A",
      Vendor: bill.vendorName || "N/A",
      "Total Items": bill.items.length || "N/A",
      "Total Amount": bill.paymentInfo.paymentAmount.toFixed(2) || "N/A",
      "Payment Type": bill.paymentInfo?.paymentType || "N/A",
      Date: formatDateToDDMMYYYY(bill.date) || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Store Billings");
    XLSX.writeFile(workbook, "Store_Billings.csv", { bookType: "csv" });
  };

  const exportToPdf = () => {
    if (filteredBillings.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const pdf = new jsPDF();
    pdf.text("Store Billings Report", 14, 10);

    const tableData = filteredBillings.map((bill, index) => [
      index + 1,
      bill.purchaseOrderNumber || "N/A",
      bill.vendorName || "N/A",
      bill.items.length || "N/A",
      bill.paymentInfo.paymentAmount.toFixed(2) || "N/A",
      bill.paymentInfo?.paymentType || "N/A",
      formatDateToDDMMYYYY(bill.date) || "N/A",
    ]);

    pdf.autoTable({
      head: [
        [
          "#",
          "Purchase Order",
          "Vendor",
          "Total Items",
          "Total Amount",
          "Payment Type",
          "Date",
        ],
      ],
      body: tableData,
    });

    pdf.save("Store_Billings.pdf");
  };

  return (
    <>
      <h2 style={{ margin: "0" }}>Store Billings</h2>
      <div className="upper-lab">
        <div className="date-filters">
          {/* <label>
            Start Date: */}
          <input
            style={{ height: "fit-content" }}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          {/* </label> */}
          {/* <label style={{ marginLeft: "20px" }}>
            End Date: */}
          <input
            style={{ height: "fit-content", marginLeft: "10px" }}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {/* </label> */}
          <button
            style={{ height: "fit-content", marginTop: "5px" }}
            className="statistics-search"
            onClick={() => fetchData()}
          >
            Show
          </button>
        </div>
        <div className="filters" style={{ display: "flex", gap: "10px" }}>
          <input
            style={{ margin: "auto 0" }}
            type="text"
            placeholder="Search Purchase Order"
            value={billNumberFilter}
            onChange={(e) => setBillNumberFilter(e.target.value)}
          />
          <select
            value={paymentMethodFilter}
            style={{ margin: "auto 0", width: "fit-content" }}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="cash">Cash</option>
            {/* <option value="credit">Credit</option> */}
            <option value="card">Card</option>
            <option value="upi">UPI</option>
          </select>
          <button
            style={{ margin: "auto 0", width: "fit-content" }}
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        <button onClick={() => setIsModalOpen(true)}>Add Billing</button>
      </div>
      <div className="lower-lab">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className="totals-ib-head">
            <p>
              <strong>Total Amount:</strong> ₹
              {parseFloat(totalAmount).toFixed(2)}
            </p>
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
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div>
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Date</th>
                  {/* <th>Bill No.</th> */}
                  <th>Puchase Order</th>
                  <th>Vendor Name</th>
                  <th>Total items</th>
                  <th>Amount</th>
                  {/* <th>Remaining Price</th> */}
                  <th>Payment Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((bill) => (
                    <tr key={bill._id}>
                      <td>{formatDateToDDMMYYYY(bill.date)}</td>
                      {/* <td>{bill.billNumber}</td> */}
                      <td>{bill.purchaseOrderNumber}</td>
                      <td>{bill.vendorName}</td>
                      <td>{bill.items.length}</td>
                      <td>{bill.paymentInfo.paymentAmount.toFixed(2)}</td>
                      {/* <td>{bill.paymentInfo.remainingDues}</td> */}
                      <td>{bill.paymentInfo?.paymentType}</td>
                      <td className="lab-btn">
                        <FontAwesomeIcon
                          icon={faEye}
                          onClick={() => handleView(bill)}
                          title="view"
                          className="icon"
                        />
                        <FontAwesomeIcon
                          icon={faPrint}
                          onClick={() => handlePrint(bill)}
                          title="print"
                          className="icon"
                        />
                        <FontAwesomeIcon
                          icon={faEdit}
                          onClick={() => handleEditing(bill)}
                          title="Edit"
                          className="icon"
                        />
                        {user?.role === "admin" && (
                          <FontAwesomeIcon
                            icon={faTrashAlt}
                            onClick={() => handleDeleteBilling(bill._id)}
                            title="Delete"
                            className="icon"
                          />
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" style={{ textAlign: "center" }}>
                      No Bills Available to Show
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

      <AddStoreBilling
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddBilling={handleAddBilling}
      />

      <EditStoreBilling
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        onUpdateBilling={handleEditSubmit}
        billingDetails={selectedBill}
      />

      {/* View bill modal */}
      {isViewModalOpen && selectedBill && (
        <div className="ipd-bill-modal-overlay">
          <div className="ipd-bill-modal-content">
            <button
              type="button"
              onClick={handleCloseView}
              className="opd-closeBtn"
            >
              X
            </button>
            <h3>Bill Details</h3>
            <div className="bill-details">
              <p>
                <strong>Purchase Order Number:</strong>{" "}
                {` ${selectedBill.purchaseOrderNumber}`}
              </p>
              <p>
                <strong>Vendor Name:</strong>
                {` ${selectedBill.vendorName}`}
              </p>
              <p>
                <strong>Payment Type:</strong>
                {` ${selectedBill.paymentInfo.paymentType.toUpperCase()}`}
              </p>
              <p>
                <strong>Date:</strong>
                {` ${formatDateToDDMMYYYY(selectedBill.date)}`}
              </p>
              <p>
                <strong>Total Charge:</strong> ₹
                {selectedBill.items.reduce(
                  (sum, obj) => sum + obj.charge * obj.quantity || 0,
                  0
                )}
              </p>
              <p>
                <strong>Total Discount:</strong> ₹
                {selectedBill.items.reduce(
                  (sum, obj) =>
                    sum + (Number(obj.charge) * Number(obj.quantity) || 0),
                  0
                ) -
                  selectedBill.items.reduce(
                    (sum, obj) => sum + (Number(obj.finalPrice) || 0),
                    0
                  )}
              </p>

              <p>
                <strong>Final Price:</strong> ₹
                {selectedBill.items.reduce(
                  (sum, obj) => sum + (Number(obj.finalPrice) || 0),
                  0
                )}
              </p>
              <p>
                <strong>Total Items:</strong> ₹{` ${selectedBill.items.length}`}
              </p>
            </div>
            <h4>Items</h4>
            <table className="bill-table">
              <thead>
                <tr>
                  <th>S. No.</th>
                  <th>Item Name</th>
                  <th>Charge</th>
                  <th>Quantity</th>
                  <th>Total Charge</th>
                  <th>Discount</th>
                  <th>Final Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill.items.map((it, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{it.name}</td>
                    <td>₹{it.charge}</td>
                    <td>{it.quantity}</td>
                    <td>₹{it.charge * it.quantity}</td>
                    <td>{it.discount}%</td>
                    <td>₹{it.finalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {patientItem && (
        <StoreBillingPrint
          //   patientDetails={patientDetails}
          selectedBill={patientItem}
          printRef={documentRef}
        />
      )}
    </>
  );
};

export default StoreBillings;
