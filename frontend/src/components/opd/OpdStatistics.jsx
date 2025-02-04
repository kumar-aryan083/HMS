import React, { useContext, useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { environment } from "../../../utlis/environment.js";
import Loader from "../Loader.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const OpdStatistics = () => {
  const { user, setNotification } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [startDate, setStartDate] = useState("2024-11-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    document.title = "OPD Statistics | HMS";
    if (
      !user ||
      (user.role !== "admin" )
    ) {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    if (!startDate || !endDate) {
      setNotification({
        message: "Please select start and end dates",
        type: "error",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/opd/get-opd-stats?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log("IPD Stats: ", data);
        setStats(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = () => {
    fetchStats();
  };

  const chartData1 = {
    labels: ["Total Bills", "Due Bills", "Paid Bills"],
    datasets: [
      {
        label: "Bill Statistics",
        data: stats ? [stats.totalBills, stats.dueBills, stats.paidBills] : [],
        backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f"],
        borderWidth: 1,
      },
    ],
  };

  const chartData2 = {
    labels: ["Total Charge", "Total Discount", "Final Amount", "Total Dues"],
    datasets: [
      {
        label: "Financial Statistics",
        data: stats
          ? [
              stats.totalCharge,
              stats.totalDiscount,
              stats.totalAmount,
              stats.totalDue,
            ]
          : [],
        backgroundColor: ["#e8c3b9", "#c45850", "#a29bfe"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  return (
    <div style={{ margin: "30px" }}>
      <h2>OPD Statistics</h2>
      <div className="date-filters" style={{ marginLeft: "50px" }}>
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
        <button className="statistics-search" onClick={handleFetch}>
          Show
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        stats && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "90%",
              margin: "50px",
            }}
          >
            <div style={{ width: "45%" }}>
              <h3>Bill Overview</h3>
              <Bar data={chartData1} options={options} />
            </div>
            <div style={{ width: "45%" }}>
              <h3>Financial Overview</h3>
              <Bar data={chartData2} options={options} />
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default OpdStatistics;
