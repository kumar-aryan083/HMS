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
import EditOpdBilling from "./EditOpdBilling.jsx";
import { useReactToPrint } from "react-to-print";
import AddOpdBilling from "./AddOpdBilling.jsx";
import IpdBillingPrint from "../ipd/IpdBillingPrint.jsx";
import IpdTotalBillingPrint from "../ipd/IpdTotalBillingPrint.jsx";
import Loader from "../Loader.jsx";
import { getUserDetails } from "../../../utlis/userDetails.js";

const OpdBilling = ({ opdId }) => {
  const { setNotification, user } = useContext(AppContext);
  const [billings, setBillings] = useState([]);
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

  const documentRef = useRef();
  const newPrintRef = useRef();

  const printBill = useReactToPrint({
    contentRef: documentRef,
  });
  const newPrint = useReactToPrint({
    contentRef: newPrintRef,
  });

  useEffect(() => {
    fetchOpdBillings();
    fetchPatientDetails();
  }, []);

  const fetchPatientDetails = async () => {
    try {
      const res = await fetch(
        `${environment.url}/api/opd/${opdId}/get-patient-opdId`,
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
        // console.log(data.patient);
        setPatientDetails(data.patient);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchOpdBillings = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/opd/getOpdBills?opdId=${opdId}`,
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
        setBillings(data.items);
        setNewItems(data.newItems);
        calculateTotals(data.items);
      }
    } catch (error) {
      console.log("error fetching opd billings", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (items) => {
    let total = 0;
    let discount = 0;
    let remaining = 0;

    items.forEach((bill) => {
      total += bill?.grandTotals?.totalCharge || 0;
      discount += bill?.grandTotals?.totalDiscount || 0;
      remaining += bill?.totalDiscounted || 0;
    });

    setTotalPrice(total);
    setTotalDiscount(discount);
    setRemainingPrice(remaining);
  };

  const handleAddBilling = async (billingData) => {
    // console.log(billingData);
    const updatedBody = {
      ...billingData,
      opdId: opdId,
    };
    // console.log("updated body", updatedBody);
    const userDetails = getUserDetails();
    const updatedForm = { ...updatedBody, ...userDetails };
    try {
      const res = await fetch(`${environment.url}/api/opd/submit-opd-bill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(updatedForm),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        fetchOpdBillings();
        // setBillings((prevBillings) => [...prevBillings, data.newBill])
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
        `${environment.url}/api/opd/delete-opd-bill/${billingId}`,
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
        setBillings((prevBillings) =>
          prevBillings.filter((bill) => bill._id !== data.bill._id)
        );
        calculateTotals(billings.filter((bill) => bill._id !== data.bill._id));
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

  const handlePaymentSubmit = async (paymentDetails) => {
    const updatedPaymentDetails = {
      ...paymentDetails,
      remainingDues:
        selectedBill.grandRemainingDues - paymentDetails.paymentAmount,
    };

    // console.log(updatedPaymentDetails);
    try {
      const res = await fetch(`${environment.url}/api/opd/add-opd-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(updatedPaymentDetails),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        fetchOpdBillings();
        setIsPaymentModalOpen(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePrint = async (bill) => {
    // console.log("selected patient item",bill)
    setPatientItem(bill);
    setTimeout(() => {
      printBill();
    }, 150);
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
    // console.log(updatedForm);
    try {
      const res = await fetch(
        `${environment.url}/api/opd/edit-opd-bill/${bill._id}`,
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
        fetchOpdBillings();
        setNotification(data.message);
        handleCloseEdit();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...billings]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(billings.length / itemsPerPage);

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
        <h2>All Billings</h2>
        <button onClick={() => setIsModalOpen(true)}>Add Billing</button>
      </div>
      <div className="lower-lab">
        <div className="totals-ib-head">
          <p>
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
          </p>
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
            <strong>Paid Amount:</strong> ₹
            {billings
              ?.reduce(
                (sum, obj) =>
                  sum +
                  obj.transactionHistory.reduce(
                    (acc, amt) => acc + (amt.paymentAmount || 0),
                    0
                  ),
                0
              )
              ?.toFixed(2)}
          </p>
          <p>
            <strong>Remaining Price:</strong> ₹
            {(
              billings?.reduce(
                (sum, obj) => sum + (obj?.grandTotals?.finalPrice || 0),
                0
              ) -
              billings?.reduce(
                (sum, obj) =>
                  sum +
                  obj.transactionHistory.reduce(
                    (acc, amt) => acc + (amt.paymentAmount || 0),
                    0
                  ),
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
          <table className="lab-table">
            <thead>
              <tr>
                <th>Bill No.</th>
                <th>Total items</th>
                <th>Total Price</th>
                <th>Total Discount</th>
                <th>Discounted Price</th>
                <th>Final Discount</th>
                <th>Final Price</th>
                <th>Paid Amount</th>
                <th>Remaining Price</th>
                {/* <th>Status</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((bill) => (
                  <tr key={bill._id}>
                    <td>{bill.billNumber}</td>
                    <td>{bill.item?.length}</td>
                    <td>{bill?.grandTotals?.totalCharge.toFixed(2)}</td>
                    <td>{bill?.grandTotals?.totalDiscount.toFixed(2)}</td>
                    <td>{bill.grandTotals?.totalDiscounted.toFixed(2)}</td>
                    <td>{bill.grandTotals?.finalDiscount.toFixed(2)}</td>
                    <td>{bill.grandTotals?.finalPrice.toFixed(2)}</td>
                    <td>
                      {bill?.transactionHistory
                        ?.reduce(
                          (acc, amt) => acc + (amt.paymentAmount || 0),
                          0
                        )
                        .toFixed(2)}
                    </td>
                    <td>
                      {(
                        bill?.grandTotals?.finalPrice -
                        bill?.transactionHistory?.reduce(
                          (acc, amt) => acc + (amt.paymentAmount || 0),
                          0
                        )
                      ).toFixed(2)}
                      {/* {bill.grandTotals?.totalDiscounted -
                                bill.transactionHistory.reduce(
                                  (acc, amt) => acc + (amt.paymentAmount || 0),
                                  0
                                )} */}
                    </td>
                    {/* <td>{bill.status}</td> */}
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
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No Bills Available to Show
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

      <AddOpdBilling
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddBilling={handleAddBilling}
        opdId={opdId}
      />

      <EditOpdBilling
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        onUpdateBilling={handleEditSubmit}
        billingDetails={selectedBill}
        opdId={opdId}
      />

      {/* View bill modal */}
      {isViewModalOpen && selectedBill && (
        <div className="ipd-bill-modal-overlay">
          <div className="ipd-bill-modal-content" style={{ width: "1000px" }}>
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
                    (acc, i) => acc + i.paymentAmount,
                    0
                  )
                )?.toFixed(2)}
              </p>
              <p>
                <strong>Discount By:</strong>
                {selectedBill.finalDiscountBy}
              </p>
            </div>
            <h4>Items</h4>
            <table className="bill-table">
              <thead>
                <tr>
                  <th>Item Type</th>
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
                    <td>OPD</td>
                    <td>{it.itemName}</td>
                    <td>₹{it.charge.toFixed(2)}</td>
                    <td>{it.quantity}</td>
                    <td>₹{it.total.toFixed(2)}</td>
                    <td>{it.discount.toFixed(2)}%</td>
                    <td>₹{it.totalCharge.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* <h4>Transaction History</h4>
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Payment Type</th>
                  <th>Transaction Id</th>
                  <th>Payment Amount</th>
                  <th>Remaining Dues</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill.transactionHistory.map((txn, index) => (
                  <tr key={index}>
                    <td>{txn.paymentType}</td>
                    <td>{txn.transactionId || "N/A"}</td>
                    <td>₹{txn.paymentAmount}</td>
                    <td>₹{txn.remainingDues}</td>
                  </tr>
                ))}
              </tbody>
            </table> */}
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
            <h3>Custom Payment</h3>
            <p>Enter amount to pay for Bill #{selectedBill.billNumber}</p>
            <p>
              <strong>Remaining Dues:</strong> ₹
              {selectedBill.grandRemainingDues}
            </p>

            <label htmlFor="paymentAmount">Custom Amount</label>
            <input
              type="number"
              id="customAmount"
              name="paymentAmount"
              value={customPaymentDetails.paymentAmount}
              onChange={handlePaymentChange}
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
              <option value="online">Online Transfer</option>
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
              {Math.max(
                selectedBill.grandRemainingDues -
                  customPaymentDetails.paymentAmount,
                0
              )}
            </p>

            <button
              onClick={() => handlePaymentSubmit(customPaymentDetails)}
              className="submit-pmnt"
            >
              Submit Payment
            </button>
          </div>
        </div>
      )}

      {patientItem.opdId && (
        <IpdBillingPrint
          patientDetails={patientDetails}
          selectedBill={patientItem}
          printRef={documentRef}
          isOpd={true}
          user={user}
        />
      )}
      {billings.length > 0 && newItems && (
        <IpdTotalBillingPrint
          bill={billings}
          printNRef={newPrintRef}
          billingItem={newItems}
          patientDetails={patientDetails}
        />
      )}
    </>
  );
};

export default OpdBilling;
