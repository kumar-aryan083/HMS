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
import AddLabBilling from "./AddLabBilling.jsx";
import EditLabBilling from "./EditLabBilling.jsx";
import LabBillingPrint from "./LabBillingPrint.jsx";
import { getUserDetails } from "../../../utlis/userDetails.js";
import * as XLSX from "xlsx"; // Import xlsx library
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables

const LabBilling = ({ admissionId }) => {
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
  const [patientNameInput, setPatientNameInput] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All"); // Existing state

  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");
  const [billNumberFilter, setBillNumberFilter] = useState("");
  const [patientNameFilter, setPatientNameFilter] = useState("");
  const [appliedPaymentFilter, setAppliedPaymentFilter] = useState("All");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );  
  const getPreviousDate = (date) => {
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    return prevDate.toISOString().split("T")[0];
  };
  const [startDate, setStartDate] = useState(getPreviousDate(endDate));

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
        ? billing.billNumber.toString().includes(billNumberFilter)
        : true;

      const matchesPatientName = patientNameFilter
        ? billing.patientName
            .toLowerCase()
            .includes(patientNameFilter.toLowerCase())
        : true;

      const matchesPaymentMethod =
        paymentMethodFilter === "All"
          ? true
          : billing.paymentInfo.paymentType.toLowerCase() ===
            paymentMethodFilter.toLowerCase();

      return matchesBillNumber && matchesPatientName && matchesPaymentMethod;
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
    fetchLabBillings();
  }, []);

  const fetchData = async () => {
    // console.log("fetchData");
    fetchLabBillings();
  };

  const fetchLabBillings = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/lab/get-new-laboratory-bills?startDate=${startDate}&endDate=${endDate}`,
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
        setBillings(data.items);
        setFilteredBillings(data.items);
        // setTotalPages(data.totalPages);
        calculateTotals(data.items);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBilling = async (billing) => {
    // console.log("ipd billing: ",billing);
    const updatedBody = {
      ...billing,
      admissionId: admissionId,
    };
    // console.log("lab bill going to backend", updatedBody);
    const userDetails = getUserDetails();
    const updatedForm = { ...updatedBody, ...userDetails };
    try {
      const res = await fetch(
        `${environment.url}/api/lab/submit-laboratory-bill`,
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
        fetchLabBillings();
        // setBillings((prevBillings) => [...prevBillings, data.newBill]);
        // setNewItems((prevItems) => [...(prevItems || []), data.newItem]);
        // calculateTotals([...billings, data.newItem]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteBilling = async (billingId) => {
    // console.log(billingId);
    try {
      const res = await fetch(
        `${environment.url}/api/lab/delete-laboratory-bill/${billingId}`,
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
        setBillings((prevBillings) => {
          const updatedBillings = prevBillings.filter(
            (bill) => bill._id !== data.bill._id
          );
          // Recalculate totals with the updated billings
          calculateTotals(updatedBillings);
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
    fetchPatientDetails(bill.patientId);
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
    // console.log("edited lab bill", bill);
    try {
      const res = await fetch(
        `${environment.url}/api/lab/update-laboratory-bill/${selectedBill._id}`,
        {
          method: "PUT",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(bill),
        }
      );
      const data = await res.json();
      if (res.ok) {
        // setBillings((prevBillings) =>
        //   prevBillings.map((existingBill) =>
        //     existingBill._id === data.bill._id ? data.bill : existingBill
        //   )
        // );

        // // Recalculate totals after updating state
        // const updatedBillings = billings.map((existingBill) =>
        //   existingBill._id === data.bill._id ? data.bill : existingBill
        // );
        // calculateTotals(updatedBillings);
        fetchLabBillings();
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
      "#": index + 1 + (currentPage - 1) * itemsPerPage,
      Date: formatDateToDDMMYYYY(bill.date) || "N/A", // Add any additional field (e.g., date of billing)
      "Bill No.": bill.billNumber || "N/A",
      "Patient Name": bill.patientName || "N/A",
      "Total Items": bill.item.map((item) => item.name).join(", ") || "N/A", // Add item names
      "Total Price": bill.grandTotals?.totalCharge.toFixed(2) || "N/A",
      "Discount": bill.grandTotals?.totalDiscount || "N/A",
      "Final Discount": bill.grandTotals?.finalDiscount || "N/A",
      "Final Price": bill.grandTotals?.finalPrice.toFixed(2) || "N/A",
      "Payment Type": bill.paymentInfo?.paymentType,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lab Billing");
    XLSX.writeFile(workbook, "Lab_Billing_List.xlsx");
  };

  const exportToCsv = () => {
    if (filteredBillings.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = filteredBillings.map((bill, index) => ({
      "#": index + 1 + (currentPage - 1) * itemsPerPage,
      Date: formatDateToDDMMYYYY(bill.date) || "N/A", // Add any additional field (e.g., date of billing)
      "Bill No.": bill.billNumber || "N/A",
      "Patient Name": bill.patientName || "N/A",
      "Total Items": bill.item.map((item) => item.name).join(", ") || "N/A", // Add item names
      "Total Price": bill.grandTotals?.totalCharge.toFixed(2) || "N/A",
      "Discount": bill.grandTotals?.totalDiscount || "N/A",
      "Final Discount": bill.grandTotals?.finalDiscount || "N/A",
      "Final Price": bill.grandTotals?.finalPrice.toFixed(2) || "N/A",
      "Payment Type": bill.paymentInfo?.paymentType,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lab Billing");
    XLSX.writeFile(workbook, "Lab_Billing_List.csv", { bookType: "csv" });
  };

  const exportToPdf = () => {
    if (filteredBillings.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const pdf = new jsPDF();
    pdf.text("Lab Billing List", 14, 10);

    const tableData = filteredBillings.map((bill, index) => [
      index + 1 + (currentPage - 1) * itemsPerPage,
      formatDateToDDMMYYYY(bill.date) || "N/A", // Add any additional field (e.g., date of billing)
      bill.billNumber || "N/A",
      bill.patientName || "N/A",
      bill.item.map((item) => item.name).join(", ") || "N/A", // Add item names
      bill.grandTotals?.totalCharge.toFixed(2) || "N/A",
      bill.grandTotals?.totalDiscount || "N/A",
      bill.grandTotals?.finalDiscount || "N/A",
      bill.grandTotals?.finalPrice.toFixed(2) || "N/A",
      bill.paymentInfo?.paymentType,
    ]);

    pdf.autoTable({
      head: [
        [
          "#",
          "Date",
          "Bill No.",
          "Patient Name",
          "Total Items",
          "Total Price",
          "Discount",
          "Final Discount",
          "Final Price",
          "Payment Type",
        ],
      ],
      body: tableData,
    });

    pdf.save("Lab_Billing_List.pdf");
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        <h2 style={{ paddingTop: "20px" }}>Laboratory Billings</h2>
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
        <button onClick={() => setIsModalOpen(true)} style={{height: "fit-content", width: "fit-content", margin: "auto 0"}}>Add Billing</button>
      </div>
      <hr className="am-h-line" style={{ margin: "0 20px" }} />
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
            placeholder="Search Bill Number"
            value={billNumberFilter}
            onChange={(e) => setBillNumberFilter(e.target.value)}
          />
          <input
            style={{ margin: "auto 0" }}
            type="text"
            placeholder="Search Patient Name"
            value={patientNameFilter}
            onChange={(e) => setPatientNameFilter(e.target.value)}
          />
          <select
            value={paymentMethodFilter}
            style={{ margin: "auto 0", width: "fit-content" }}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="cash">Cash</option>
            <option value="credit">Credit</option>
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
        
      </div>
      <div className="lower-lab">
        <div className="totals-ib-head">
          <p>
            <strong>Total Price:</strong> ₹
            {filteredBillings
              ?.reduce(
                (sum, obj) => sum + (obj?.grandTotals?.totalCharge || 0),
                0
              )
              ?.toFixed(2)}
          </p>
          <p>
            <strong>Total Discount:</strong> ₹
            {filteredBillings
              ?.reduce(
                (sum, obj) => sum + (obj?.grandTotals?.totalDiscount || 0),
                0
              )
              ?.toFixed(2)}
          </p>
          <p>
            <strong>Discounted Price:</strong> ₹
            {filteredBillings
              ?.reduce(
                (sum, obj) => sum + (obj?.grandTotals?.totalDiscounted || 0),
                0
              )
              ?.toFixed(2)}
          </p>
          <p>
            <strong>Final Discount:</strong> ₹
            {filteredBillings
              ?.reduce(
                (sum, obj) => sum + (obj?.grandTotals?.finalDiscount || 0),
                0
              )
              ?.toFixed(2)}
          </p>
          <p>
            <strong>Final Price:</strong> ₹
            {filteredBillings
              ?.reduce(
                (sum, obj) => sum + (obj?.grandTotals?.finalPrice || 0),
                0
              )
              ?.toFixed(2)}
          </p>
          <p>
            <strong>Paid Amount:</strong> ₹
            {filteredBillings
              ?.reduce((sum, obj) => sum + obj.paymentInfo?.paymentAmount, 0)
              ?.toFixed(2)}
          </p>
          <p>
            <strong>Remaining Price:</strong> ₹
            {(
              filteredBillings?.reduce(
                (sum, obj) => sum + (obj?.grandTotals?.finalPrice || 0),
                0
              ) -
              filteredBillings?.reduce(
                (sum, obj) => sum + obj.paymentInfo.paymentAmount,
                0
              )
            )?.toFixed(2)}
          </p>

          {/* overall bill printing */}

          {/* <FontAwesomeIcon
            icon={faPrint}
            onClick={() => handlePrint2()}
            title="print"
            className="icon"
          />  */}
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div>
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Bill No.</th>
                  <th>Patient Name</th>
                  <th>Total items</th>
                  {/* <th>Total Price</th> */}
                  {/* <th>Items Discount</th> */}
                  {/* <th>Discounted Price</th> */}
                  {/* <th>Final Discount</th> */}
                  <th>Final Price</th>
                  <th>Payment Type</th>
                  {/* <th>Paid Amount</th>
                  <th>Remaining Price</th>
                  <th>Status</th> */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((bill) => (
                    <tr key={bill._id}>
                      <td>{formatDateToDDMMYYYY(bill.date)}</td>
                      <td>{bill.billNumber}</td>
                      <td>{bill.patientName}</td>
                      <td>{bill.item.length}</td>
                      {/* <td>{bill?.grandTotals?.totalCharge.toFixed(2)}</td> */}
                      {/* <td>{bill?.grandTotals?.totalDiscount.toFixed(2)}</td> */}
                      {/* <td>{bill.grandTotals?.totalDiscounted.toFixed(2)}</td> */}
                      {/* <td>{bill.grandTotals?.finalDiscount}</td> */}
                      <td>{bill.grandTotals?.finalPrice.toFixed(2)}</td>
                      <td>{bill.paymentInfo?.paymentType}</td>
                      {/* <td>
                        {bill?.transactionHistory
                          .reduce(
                            (acc, amt) => acc + (amt.paymentAmount || 0),
                            0
                          )
                          .toFixed(2)}
                      </td>
                      <td>
                        {(
                          bill?.grandTotals?.finalPrice -
                          bill?.transactionHistory.reduce(
                            (acc, amt) => acc + (amt.paymentAmount || 0),
                            0
                          )
                        ).toFixed(2)}
                      </td>
                      <td>{bill.status}</td> */}
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
                        {user?.role ==="admin" && <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() => handleDeleteBilling(bill._id)}
                          title="Delete"
                          className="icon"
                        />}
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

      <AddLabBilling
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddBilling={handleAddBilling}
        admissionId={admissionId}
      />

      <EditLabBilling
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
                <strong>Bill Number:</strong> {selectedBill.billNumber}
              </p>
              {/* <p>
                <strong>Status:</strong> {selectedBill.status}
              </p> */}
              <p>
                <strong>Total Charge:</strong> ₹
                {selectedBill?.grandTotals?.totalCharge}
              </p>
              <p>
                <strong>Total Discount:</strong> ₹
                {selectedBill?.grandTotals?.totalDiscount}
              </p>
              {/* <p>
                <strong>Total After Discount:</strong> ₹
                {selectedBill?.grandTotals?.totalDiscounted}
              </p>
              <p>
                <strong>Final Discount:</strong> ₹
                {selectedBill?.grandTotals?.finalDiscount}
              </p> */}
              <p>
                <strong>Payable Price:</strong> ₹
                {selectedBill?.grandTotals?.finalPrice}
              </p>
              <p>
                <strong>Remaining Dues:</strong> ₹
                {parseInt(selectedBill.paymentInfo?.remainingDues)?.toFixed(2)}
              </p>
              <p>
                <strong>Discounted By:</strong> 
                {selectedBill.finalDiscountBy}
              </p>
            </div>
            <h4>Items</h4>
            <table className="bill-table">
              <thead>
                <tr>
                  {/* <th>Item Type</th> */}
                  <th>Item Name</th>
                  <th>Charge</th>
                  <th>Quantity</th>
                  <th>Total Charge</th>
                  <th>Discount</th>
                  <th>Discounted Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill.item.map((it, index) => (
                  <tr key={index}>
                    {/* <td>{it.itemType}</td> */}
                    <td>{it.itemName}</td>
                    <td>₹{it.charge}</td>
                    <td>{it.quantity}</td>
                    <td>₹{it.total}</td>
                    <td>{it.discount}%</td>
                    <td>₹{it.totalCharge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {patientItem && (
        <LabBillingPrint
          patientDetails={patientDetails}
          selectedBill={patientItem}
          printRef={documentRef}
        />
      )}
    </>
  );
};

export default LabBilling;
