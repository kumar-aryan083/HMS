import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrashAlt,
  faEye,
  faPrint,
  faMoneyBillWave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "../laboratory/styles/AddLabTest.css";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";
import AddIpdBilling from "./AddIpdBilling.jsx";
import "./styles/IpdBilling.css";
import { useReactToPrint } from "react-to-print";
import IpdTotalBillingPrint from "./IpdTotalBillingPrint.jsx";
import IpdPaymentPrint from "./IpdPaymentPrint.jsx";
import TransactionSlip from "../TransactionSlip.jsx";
import EditIpdPayment from "./EditIpdPayment.jsx";
import Loader from "../Loader.jsx";
import { getUserDetails } from "../../../utlis/userDetails.js";
import PrintablePayments from "./PrintablePayments.jsx";

const IpdPayments = ({ admissionId }) => {
  const { setNotification, user } = useContext(AppContext);
  const [billings, setBillings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [remainingPrice, setRemainingPrice] = useState(0);
  const [patientDetails, setPatientDetails] = useState({});
  const [isAddPayment, setIsAddPayment] = useState(false);
  const [isEditPayment, setIsEditPayment] = useState(false);
  const [patientItem, setPatientItem] = useState({});
  const [newItems, setNewItems] = useState(null);
  const [paymentDue, setPaymentDue] = useState(null);
  const [totalPaidPayment, setTotalPaidPayment] = useState(null);
  const [previousPayments, setPreviousPayments] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [customPaymentDetails, setCustomPaymentDetails] = useState({
    billId: "",
    paymentAmount: "",
    paymentType: "cash",
    transactionId: "",
    remainingDues: 0,
  });
  const [editPaymentDetails, setEditPaymentDetails] = useState({
    billId: "",
    paymentAmount: "",
    paymentType: "",
    transactionId: "",
    remainingDues: 0,
  });
  const [billType, setBillType] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const documentRef = useRef();
  const newPrintRef = useRef();
  const payPrintRef = useRef();

  const printPay = useReactToPrint({
    contentRef: payPrintRef,
  });

  const printBill = useReactToPrint({
    contentRef: documentRef,
  });

  const newPrint = useReactToPrint({
    contentRef: newPrintRef,
  });

  useEffect(() => {
    fetchIpdBillings();
    fetchPatientDetails();
    fetchPaymentDues();
  }, []);

  const fetchPaymentDues = async () => {
    try {
      const res = await fetch(
        `${environment.url}/api/account/get-patient-dues/${admissionId}`,
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
        // console.log("Payment: ", data.previousPayments);
        setPaymentDue(data.totalDue);
        setTotalPaidPayment(data.previousPaymentTotal);
        setPreviousPayments(data.previousPayments);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPatientDetails = async () => {
    try {
      const res = await fetch(
        `${environment.url}/api/patient/get-patient-from-admission-id?admissionId=${admissionId}`,
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
        // console.log(data.patient);
        setPatientDetails(data.patient);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchIpdBillings = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/get-ipd-bills?admissionId=${admissionId}`,
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
        // console.log("ipd billings ----", data);
        setBillings(data.items);
        setNewItems(data.newItems);
        calculateTotals(data.items);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddBilling = async (billing) => {
    // console.log("ipd billing: ",billing);
    const updatedBody = {
      ...billing,
      admissionId: admissionId,
    };
    // console.log(updatedBody);
    try {
      const res = await fetch(`${environment.url}/api/ipd/submit-ipd-bill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(updatedBody),
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setNotification(data.message);
        setIsModalOpen(false);
        fetchIpdBillings();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeletePayment = async (billingId) => {
    // console.log(billingId);
    try {
      const res = await fetch(
        `${environment.url}/api/patient/delete-payment/${admissionId}/${billingId}`,
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
        fetchPaymentDues();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePrint = (bill) => {
    setPatientItem(bill);
    setTimeout(() => {
      printBill();
    }, 50);
  };
  const handlePrintPay = (bill) => {
    setPatientItem(bill);
    setTimeout(() => {
      printPay();
    }, 50);
  };

  const handlePrint2 = async () => {
    // console.log(bill);
    setTimeout(() => {
      newPrint();
    }, 150);
  };

  const handleView = (bill) => {
    setSelectedBill(bill);
    setIsViewModalOpen(true);
  };

  const handleCloseView = () => {
    setIsViewModalOpen(false);
  };

  const handleEditing = (payment) => {
    // console.log("payment to be edited", payment);
    setEditPaymentDetails({
      ...editPaymentDetails,
      paymentAmount: payment.paymentAmount,
      paymentType: payment.paymentType,
      transactionId: payment.transactionId,
    });
    setSelectedPayment(payment);
    setIsEditPayment(true);
    // setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
  };

  const handleEditSubmit = async (bill) => {
    // e.preventDefault();
    // console.log(bill);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd//edit-ipd-bill/${selectedBill._id}`,
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
        fetchIpdBillings();
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
  const handleEditPaymentChange = (e) => {
    const { name, value } = e.target;
    setEditPaymentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTotalPaymentSubmit = async (paymentDetails) => {
    // console.log("payment details: ", paymentDetails, patientDetails);
    const transaction = {
      paymentType: paymentDetails.paymentType,
      paymentAmount: paymentDetails.paymentAmount,
      transactionId: paymentDetails.transactionId,
      remarks: "OK",
      date: new Date(),
      ...getUserDetails(), // Add user details directly into the transaction
    };

    // Construct the new bill
    const newBill = {
      patientId: patientDetails.patientId,
      patientName: patientDetails.name,
      admissionId: admissionId,
      transaction, // Use the updated transaction with userDetails
    };
    // console.log("new bill", newBill);
    try {
      const res = await fetch(
        `${environment.url}/api/patient/add-patient-payment`,
        {
          method: "POST",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(newBill),
        }
      );
      const data = await res.json();
      if (res.ok) {
        // fetchIpdBillings();
        setNotification(data.message);
        setIsAddPayment(false);
        fetchPaymentDues();
        setCustomPaymentDetails({
          billId: "",
          paymentAmount: 0,
          transactionId: "",
          paymentType: "cash",
        });
        // setTimeout(() => {
        //   handlePrint(newBill.transaction);
        // }, 50);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleEditPaymentSubmit = async (paymentDetails) => {
    // console.log("payment details: ", paymentDetails, patientDetails);
    const transaction = {
      paymentType: paymentDetails.paymentType,
      paymentAmount: paymentDetails.paymentAmount,
      transactionId: paymentDetails.transactionId,
      remarks: "OK",
      date: new Date(),
      ...getUserDetails(), // Add user details directly into the transaction
    };
    const newBill = {
      patientId: patientDetails.patientId,
      patientName: patientDetails.name,
      admissionId: admissionId,
      transaction
    };
    // console.log("data to backend", newBill, selectedPayment);
    try {
      const res = await fetch(
        `${environment.url}/api/patient/edit-payment/${admissionId}/${selectedPayment.paymentNumber}`,
        {
          method: "PUT",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(newBill),
        }
      );
      const data = await res.json();
      if (res.ok) {
        // fetchIpdBillings();
        setNotification(data.message);
        setIsEditPayment(false);
        fetchPaymentDues();
        setEditPaymentDetails({
          billId: "",
          paymentAmount: 0,
          transactionId: "",
          paymentType: "cash",
        });
        // setTimeout(() => {
        //   handlePrint(newBill.transaction);
        // }, 50);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePaymentClick = (bill) => {
    setSelectedBill(bill);
    if (
      !bill?.item?.some(
        (i) =>
          i.itemType === "all" || i.itemType === "ipd" || i.itemType === "opd"
      ) &&
      bill?.grandTotals?.finalPrice ==
        bill?.transactionHistory?.reduce(
          (acc, i) => acc + i?.paymentAmount || 0,
          0
        )
    ) {
      setPatientItem(bill);
      setTimeout(() => {
        printPay();
      }, 50);
    } else {
      setCustomPaymentDetails((pre) => ({
        ...pre,
        billId: bill._id,
        paymentAmount: selectedBill?.item?.some(
          (i) =>
            i.itemType === "all" || i.itemType === "ipd" || i.itemType === "opd"
        )
          ? (
              bill?.grandTotals?.finalPrice -
              bill?.transactionHistory?.reduce(
                (acc, i) => acc + i?.paymentAmount || 0,
                0
              )
            )?.toFixed(2)
          : 0,
      }));
      setIsPaymentModalOpen(true);
    }
    // if (selectedBill.item.some((i) => i.itemType === "all")) {
    //   setCustomPaymentDetails({
    //     billId: bill._id,
    //     paymentAmount: "",
    //     paymentType: "cash",
    //     transactionId: "",
    //     remainingDues: bill.grandRemainingDues,
    //   });
    // } else {
    //   setCustomPaymentDetails({
    //     billId: bill._id,
    //     paymentAmount: bill.grandRemainingDues,
    //     paymentType: "cash",
    //     transactionId: "",
    //     remainingDues: bill.grandRemainingDues,
    //   });
    // }
  };

  const handlePaymentSubmit = async (paymentDetails) => {
    const updatedPaymentDetails = {
      ...paymentDetails,
      remainingDues: (
        parseFloat(selectedBill?.grandTotals?.finalPrice) -
        selectedBill?.transactionHistory?.reduce(
          (acc, i) => acc + i.paymentAmount || 0,
          0
        ) -
        paymentDetails.paymentAmount
      )?.toFixed(2),
    };
    // console.log("updated payment: ", { updatedPaymentDetails });

    try {
      const res = await fetch(`${environment.url}/api/ipd/add-ipd-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(updatedPaymentDetails),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        // printPay();
        fetchIpdBillings();
        setIsPaymentModalOpen(false);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...previousPayments]
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(previousPayments.length / itemsPerPage);

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
    <>
      <div className="upper-lab">
        <h2>All Payments</h2>
        <button onClick={() => setIsAddPayment(true)}>Add Payment</button>
      </div>
      <div className="lower-lab">
        <div className="totals-ib-head">
          {/* <p>
            <strong>Total Price:</strong> ₹
            {billings
              ?.reduce(
                (sum, obj) => sum + (obj?.grandTotals?.totalCharge || 0),
                0
              )
              ?.toFixed(2)}
          </p>
          <p>
            <strong>Total Discount:</strong> ₹
            {billings
              ?.reduce(
                (sum, obj) => sum + (obj?.grandTotals?.totalDiscount || 0),
                0
              )
              ?.toFixed(2)}
          </p>
          <p>
            <strong>Discounted Price:</strong> ₹
            {billings
              ?.reduce(
                (sum, obj) => sum + (obj?.grandTotals?.totalDiscounted || 0),
                0
              )
              ?.toFixed(2)}
          </p>
          <p>
            <strong>Final Discount:</strong> ₹
            {billings
              ?.reduce(
                (sum, obj) => sum + (obj?.grandTotals?.finalDiscount || 0),
                0
              )
              ?.toFixed(2)}
          </p> */}
          <p>
            <strong>Final Price:</strong> ₹
            {billings
              ?.reduce(
                (sum, obj) => sum + (obj?.grandTotals?.finalPrice || 0),
                0
              )
              ?.toFixed(2)}
          </p>
          <p>
            <strong>Paid Amount:</strong> ₹{totalPaidPayment?.toFixed(2)}
          </p>
          <p
            style={{
              color:
                billings?.reduce(
                  (sum, obj) => sum + (obj?.grandTotals?.finalPrice || 0),
                  0
                ) -
                  totalPaidPayment <
                0
                  ? "green"
                  : "red",
            }}
          >
            <strong>
              {billings?.reduce(
                (sum, obj) => sum + (obj?.grandTotals?.finalPrice || 0),
                0
              ) -
                totalPaidPayment <
              0
                ? "Available Balance"
                : "Remaining Price"}
            </strong>{" "}
            ₹
            {billings?.reduce(
              (sum, obj) => sum + (obj?.grandTotals?.finalPrice || 0),
              0
            ) -
              totalPaidPayment <
            0
              ? (
                  totalPaidPayment -
                  billings?.reduce(
                    (sum, obj) => sum + (obj?.grandTotals?.finalPrice || 0),
                    0
                  )
                ).toFixed(2)
              : (
                  billings?.reduce(
                    (sum, obj) => sum + (obj?.grandTotals?.finalPrice || 0),
                    0
                  ) - totalPaidPayment
                )?.toFixed(2)}
          </p>

          {/* overall bill printing */}

          <FontAwesomeIcon
            icon={faPrint}
            onClick={() => handlePrint2()}
            title="print"
            className="icon"
          />
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div>
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Payment No.</th>
                  <th>Date</th>
                  <th>Payment Amount</th>
                  <th>Payment Type</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((bill) => (
                    <tr key={bill._id}>
                      <td>{bill.paymentNumber || "N/A"}</td>
                      <td>{formatDateToDDMMYYYY(bill.date) || "N/A"}</td>
                      <td>{bill.paymentAmount.toFixed(2)}</td>
                      <td>{bill.paymentType}</td>
                      <td>{bill.remarks}</td>
                      <td className="lab-btn">
                        {/* <FontAwesomeIcon
                          icon={faEye}
                          onClick={() => handleView(bill)}
                          title="view"
                          className="icon"
                        /> */}
                        <FontAwesomeIcon
                          icon={faEdit}
                          onClick={() => handleEditing(bill)}
                          title="Edit"
                          className="icon"
                        />
                        <FontAwesomeIcon
                          icon={faPrint}
                          onClick={() => handlePrint(bill)}
                          title="print"
                          className="icon"
                        />
                        {user?.role === "admin" && (
                          <FontAwesomeIcon
                            icon={faTrashAlt}
                            onClick={() =>
                              handleDeletePayment(bill.paymentNumber)
                            }
                            title="delete"
                            className="icon"
                          />
                        )}
                        {/* <FontAwesomeIcon
                          icon={faMoneyBillWave}
                          onClick={() => handlePaymentClick(bill)}
                          title="Pay Now"
                          className="icon pay-now"
                        /> */}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
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

      <AddIpdBilling
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddBilling={handleAddBilling}
        admissionId={admissionId}
      />

      <EditIpdPayment
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        onUpdateBilling={handleEditSubmit}
        billingDetails={selectedBill}
        admissionId={admissionId}
      />

      {/* View bill modal */}
      {isViewModalOpen && selectedBill && (
        <div className="ipd-bill-modal-overlay">
          <div className="ipd-bill-modal-content">
            <button
              type="button"
              onClick={handleCloseView}
              className="ipd-bill-closeBtn"
            >
              &times;
            </button>
            <h3>Payment Ledger</h3>
            <div className="bill-details">
              <p>
                <strong>Bill Number:</strong> {selectedBill.billNumber}
              </p>
              <p>
                <strong>Status:</strong> {selectedBill.status}
              </p>
              <p>
                <strong>Total Charge:</strong> ₹
                {selectedBill?.grandTotals?.totalCharge.toFixed(2)}
              </p>
              <p>
                <strong>Total Discount:</strong> ₹
                {selectedBill?.grandTotals?.totalDiscount.toFixed(2)}
              </p>
              <p>
                <strong>Total After Discount:</strong> ₹
                {selectedBill?.grandTotals?.totalDiscounted.toFixed(2)}
              </p>
              <p>
                <strong>Final Discount:</strong> ₹
                {selectedBill?.grandTotals?.finalDiscount.toFixed(2)}
              </p>
              <p>
                <strong>Payable Price:</strong> ₹
                {selectedBill?.grandTotals?.finalPrice.toFixed(2)}
              </p>
              <p>
                <strong>Remaining Dues:</strong> ₹
                {(
                  selectedBill?.grandTotals?.finalPrice -
                  selectedBill?.transactionHistory?.reduce(
                    (acc, i) => acc + i?.paymentAmount || 0,
                    0
                  )
                )?.toFixed(2)}
              </p>
            </div>
            <h4>Transaction History</h4>
            <table className="bill-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction Type</th>
                  <th>Transaction Id</th>
                  <th>Paid Amount</th>
                  <th>Remaining Due</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill?.transactionHistory?.map((it, index) => (
                  <tr key={index}>
                    <td>{new Date(it.date)?.toLocaleDateString()}</td>
                    <td>{it.paymentType || "N/A"}</td>
                    <td>{it.transactionId || "N/A"}</td>
                    <td>
                      ₹
                      {!isNaN(parseFloat(it.paymentAmount))
                        ? parseFloat(it.paymentAmount).toFixed(2)
                        : "0.00"}
                    </td>
                    <td>
                      {!isNaN(parseFloat(it?.remainingDues))
                        ? parseFloat(it?.remainingDues).toFixed(2)
                        : "0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAddPayment && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-content">
            <button
              className="opd-closeBtn"
              onClick={() => {
                setCustomPaymentDetails({
                  billId: "",
                  paymentAmount: "",
                  paymentType: "cash",
                  transactionId: "",
                  remainingDues: 0,
                });
                setIsAddPayment(false);
              }}
            >
              X
            </button>
            <h3>Add Payment</h3>
            <p>
              <strong>Remaining Dues:</strong> ₹{paymentDue?.toFixed(2)}
            </p>

            <label htmlFor="paymentAmount">Add Amount</label>
            <input
              type="number"
              id="customAmount"
              name="paymentAmount"
              value={customPaymentDetails.paymentAmount || ""}
              onChange={handlePaymentChange}
              // readOnly={
              //   !selectedBill?.item?.some(
              //     (i) =>
              //       i.itemType === "all" ||
              //       i.itemType === "ipd" ||
              //       i.itemType === "opd"
              //   )
              // }
            />

            <label htmlFor="paymentType">Payment Type</label>
            <select
              id="paymentType"
              name="paymentType"
              value={customPaymentDetails.paymentType}
              onChange={handlePaymentChange}
            >
              <option value="cash">Cash</option>
              <option value="creditCard">Credit Card</option>
              <option value="upi">UPI</option>
            </select>

            <label htmlFor="transactionId">Transaction ID</label>
            <input
              type="text"
              id="transactionId"
              name="transactionId"
              value={customPaymentDetails.transactionId}
              onChange={handlePaymentChange}
            />

            {/* <p>
              <strong>Remaining Price After Payment:</strong> ₹
              {(
                selectedBill?.grandTotals?.finalPrice -
                selectedBill?.transactionHistory?.reduce(
                  (acc, i) => acc + i?.paymentAmount || 0,
                  0
                ) -
                customPaymentDetails.paymentAmount
              )?.toFixed(2)}
            </p> */}

            <button
              onClick={() => handleTotalPaymentSubmit(customPaymentDetails)}
              className="submit-pmnt"
            >
              Submit Payment
            </button>
            {/* <button
              onClick={() => {
                setPatientItem(selectedBill);
                setTimeout(() => {
                  handlePrint(patientItem);
                }, 50);
              }}
              className="submit-pmnt"
            >
              Print Last Payment
            </button> */}
          </div>
        </div>
      )}
      {isEditPayment && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-content">
            <button
              className="opd-closeBtn"
              onClick={() => {
                setEditPaymentDetails({
                  billId: "",
                  paymentAmount: "",
                  paymentType: "cash",
                  transactionId: "",
                  remainingDues: 0,
                });
                setIsEditPayment(false);
              }}
            >
              X
            </button>
            <h3>Edit Payment</h3>
            <p>
              <strong>Remaining Dues:</strong> ₹{paymentDue?.toFixed(2)}
            </p>

            <label htmlFor="paymentAmount">Add Amount</label>
            <input
              type="number"
              id="customAmount"
              name="paymentAmount"
              value={editPaymentDetails.paymentAmount || ""}
              onChange={handleEditPaymentChange}
              // readOnly={
              //   !selectedBill?.item?.some(
              //     (i) =>
              //       i.itemType === "all" ||
              //       i.itemType === "ipd" ||
              //       i.itemType === "opd"
              //   )
              // }
            />

            <label htmlFor="paymentType">Payment Type</label>
            <select
              id="paymentType"
              name="paymentType"
              value={editPaymentDetails.paymentType}
              onChange={handleEditPaymentChange}
            >
              <option value="cash">Cash</option>
              <option value="creditCard">Credit Card</option>
              <option value="upi">UPI</option>
            </select>

            <label htmlFor="transactionId">Transaction ID</label>
            <input
              type="text"
              id="transactionId"
              name="transactionId"
              value={editPaymentDetails.transactionId}
              onChange={handleEditPaymentChange}
            />

            {/* <p>
              <strong>Remaining Price After Payment:</strong> ₹
              {(
                selectedBill?.grandTotals?.finalPrice -
                selectedBill?.transactionHistory?.reduce(
                  (acc, i) => acc + i?.paymentAmount || 0,
                  0
                ) -
                customPaymentDetails.paymentAmount
              )?.toFixed(2)}
            </p> */}

            <button
              onClick={() => handleEditPaymentSubmit(editPaymentDetails)}
              className="submit-pmnt"
            >
              Submit Payment
            </button>
            {/* <button
              onClick={() => {
                setPatientItem(selectedBill);
                setTimeout(() => {
                  handlePrint(patientItem);
                }, 50);
              }}
              className="submit-pmnt"
            >
              Print Last Payment
            </button> */}
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-content">
            <button
              className="modal-close-btn"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3>Add Payment</h3>
            <p>Enter amount to pay for Bill #{selectedBill.billNumber}</p>
            <p>
              <strong>Remaining Dues:</strong> ₹
              {selectedBill?.grandTotals?.finalPrice -
                selectedBill?.transactionHistory?.reduce(
                  (acc, i) => acc + i?.paymentAmount || 0,
                  0
                )}
            </p>

            <label htmlFor="paymentAmount">Add Amount</label>
            <input
              type="number"
              id="customAmount"
              name="paymentAmount"
              value={customPaymentDetails.paymentAmount || ""}
              onChange={handlePaymentChange}
              readOnly={
                !selectedBill?.item?.some(
                  (i) =>
                    i.itemType === "all" ||
                    i.itemType === "ipd" ||
                    i.itemType === "opd"
                )
              }
            />

            <label htmlFor="paymentType">Payment Type</label>
            <select
              id="paymentType"
              name="paymentType"
              value={customPaymentDetails.paymentType}
              onChange={handlePaymentChange}
            >
              <option value="cash">Cash</option>
              <option value="creditCard">Credit Card</option>
              <option value="upi">UPI</option>
            </select>

            <label htmlFor="transactionId">Transaction ID</label>
            <input
              type="text"
              id="transactionId"
              name="transactionId"
              value={customPaymentDetails.transactionId}
              onChange={handlePaymentChange}
            />

            <p>
              <strong>Remaining Price After Payment:</strong> ₹
              {(
                selectedBill?.grandTotals?.finalPrice -
                selectedBill?.transactionHistory?.reduce(
                  (acc, i) => acc + i?.paymentAmount || 0,
                  0
                ) -
                customPaymentDetails.paymentAmount
              )?.toFixed(2)}
            </p>

            <button
              onClick={() => handlePaymentSubmit(customPaymentDetails)}
              className="submit-pmnt"
            >
              Submit Payment
            </button>
            <button
              onClick={() => {
                setPatientItem(selectedBill);
                setTimeout(() => {
                  printPay();
                }, 50);
              }}
              className="submit-pmnt"
            >
              Print Last Payment
            </button>
          </div>
        </div>
      )}

      {patientItem && (
        <TransactionSlip
          payRef={payPrintRef}
          patientDetails={patientDetails}
          selectedBill={patientItem}
          billType={billType}
        />
      )}

      {patientItem && (
        <IpdPaymentPrint
          patientDetails={patientDetails}
          selectedBill={patientItem}
          printRef={documentRef}
          user={user}
        />
      )}

      {previousPayments.length > 0 && (
        <PrintablePayments
          patientDetails={patientDetails}
          printRef={newPrintRef}
          payments={previousPayments}
        />
      )}

      {/* {billings?.length > 0 && newItems && (
        <IpdTotalBillingPrint
          bill={billings}
          printNRef={newPrintRef}
          billingItem={newItems}
          patientDetails={patientDetails}
        />
      )} */}
    </>
  );
};

export default IpdPayments;
