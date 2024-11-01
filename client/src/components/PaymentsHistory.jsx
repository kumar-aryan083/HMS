import React, { useEffect, useState } from 'react';
import './styles/PaymentsHistory.css';

const PaymentsHistory = ({ opdId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/opd/${opdId}/payments`,{
            method: "GET",
            headers:{
                "Content-Type": "application/json",
                token: localStorage.getItem('token')
            }
        });
        const data = await response.json();
        if (data.success) {
          setPayments(data.payments);
        }
      } catch (error) {
        console.error('Error fetching payment details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [opdId]);

  if (loading) return <p>Loading payment details...</p>;

  return (
    <div className="payment-details-container">
      <h2 className="payment-details-heading">Payment Records</h2>
      <table className="payment-details-table">
        <thead>
          <tr className="payment-details-header">
            <th className="header-item purpose-item">Purpose</th>
            <th className="header-item amount-item">Amount</th>
            <th className="header-item mode-item">Payment Mode</th>
            <th className="header-item date-item">Date</th>
            <th className="header-item transaction-id-item">Transaction ID</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment._id} className="payment-details-row">
              <td className="row-item purpose-item">{payment.purpose}</td>
              <td className="row-item amount-item">Rs {payment.amount.toFixed(2)}</td>
              <td className="row-item mode-item">{payment.mode}</td>
              <td className="row-item date-item">
                {new Date(payment.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </td>
              <td className="row-item transaction-id-item">
                {payment.transactionId || 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentsHistory;
