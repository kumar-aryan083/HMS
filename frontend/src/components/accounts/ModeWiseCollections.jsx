import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { environment } from '../../../utlis/environment';
import Loader from '../Loader';

const ModeWiseCollections = () => {
  const { setNotification, user } = useContext(AppContext);
  const [collections, setCollections] = useState([]);
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    fetchModeWise();
  };

  const fetchModeWise = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/account/get-mode-wise-collection?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log("All Mode wise collections", data);
        setCollections(data.items);
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
      {/* <h2>Mode Wise Collections</h2> */}
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
          <button className="statistics-search" onClick={() => fetchData()}>
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
              <th>Mode</th>
              <th>Total Payment</th>
            </tr>
          </thead>
          <tbody>
            {collections && collections.length > 0 ? (
              collections.map((collection, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{collection.name}</td>
                  <td>{collection.payment.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-data">
                  No Mode wise Collections to show yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ModeWiseCollections;
