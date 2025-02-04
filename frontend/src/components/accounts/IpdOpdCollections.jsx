import React, { useContext, useEffect, useRef, useState } from "react";
import "../storeItem/styles/StoreItemList.css";
import "./styles/IpdOpdCollections.css";
import Loader from "../Loader";
import { AppContext } from "../../context/AppContext";
import { environment } from "../../../utlis/environment";

const IpdOpdCollections = () => {
  const { setNotification, user } = useContext(AppContext);
  const [supplies, setSupplies] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStoreSupplies();
  }, []);


  const fetchStoreSupplies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/store/get-supplies`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setSupplies(data.supplies);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
    }
    setLoading(false);
  };


  return (
    <div className="accounts-list">
      <h2>All Ipd Opd Collections</h2>
      <div className="accounts-date">
            <div className="date-filters">
              <label>
                Start Date:
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label style={{ marginLeft: "20px" }}>
                End Date:
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
              <button className="statistics-search">
                Show
              </button>
            </div>
          </div>
      <hr className="am-h-line" />

      {loading ? (
        <Loader />
      ) : (
        <table className="accounts-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Receiver</th>
              <th>Voucher No.</th>
              <th>Department</th>
              <th>Total Items</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {supplies && supplies.length > 0 ? (
              supplies.map((store, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{store.receiverId?.name || "N/A"}</td>
                  <td>{store.voucherNo}</td>
                  <td>{store.departmentName}</td>
                  <td>{store.items.length}</td>
                  <td>{store.phone}</td>
                  <td>{store.status.toUpperCase()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No Total Collections to show yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default IpdOpdCollections;
