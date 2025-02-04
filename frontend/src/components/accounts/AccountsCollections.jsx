import React, { useContext, useEffect, useState } from "react";
import "./styles/AccountsCollections.css";
import IpdCollections from "./IpdCollections";
import OpdCollections from "./OpdCollections";
import PharmacyCollections from "./PharmacyCollections";
import LaboratoryCollections from "./LaboratoryCollections";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import Loader from "../Loader";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import AdditionalServiceCollection from "./AdditionalServiceCollection";

const AccountsCollections = () => {
  const { setNotification } = useContext(AppContext);
  const [ipdCollections, setIpdCollections] = useState([]);
  const [opdCollections, setOpdCollections] = useState([]);
  const [pharmacyCollections, setPharmacyCollections] = useState([]);
  const [labCollections, setLabCollections] = useState([]);
  const [additionalServiceCollection, setAdditionalServiceCollection] = useState([]);
  const [activeTab, setActiveTab] = useState("IPD");
  const [startDate, setStartDate] = useState("2024-11-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/account/get-collection?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log("data", data);
        setIpdCollections(data.ipdCollection);
        setOpdCollections(data.opdCollection);
        setPharmacyCollections(data.pharmacyCollection);
        setLabCollections(data.laboratoryCollection);
        setAdditionalServiceCollection(data.additionalServiceCollection);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "IPD":
        return <IpdCollections data={ipdCollections} />;
      case "OPD":
        return <OpdCollections data={opdCollections} />;
      case "Pharmacy":
        return <PharmacyCollections data={pharmacyCollections} />;
      case "Lab":
        return <LaboratoryCollections data={labCollections} />;
      case "Additional Service":
        return <AdditionalServiceCollection data={additionalServiceCollection} />;
      default:
        return null;
    }
  };

  const calculateTotal = () => {
    const ipdTotal = ipdCollections.reduce((sum, item) => sum + item.amount, 0);
    const opdTotal = opdCollections.reduce((sum, item) => sum + item.amount, 0);
    const pharmacyTotal = pharmacyCollections.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const labTotal = labCollections.reduce((sum, item) => sum + item.amount, 0);
    const additonalTotal = additionalServiceCollection.reduce((sum, item) => sum + item.amount, 0);

    return ipdTotal + opdTotal + pharmacyTotal + labTotal + additonalTotal;
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleSearch = () => {
    fetchData();
  };

  const exportToExcel = () => {
    const combinedData = [
      { section: "IPD Collection", data: ipdCollections },
      { section: "OPD Collection", data: opdCollections },
      { section: "Pharmacy Collection", data: pharmacyCollections },
      { section: "Lab Collection", data: labCollections },
      { section: "Additional Service Collection", data: additionalServiceCollection },
    ];
    const wb = XLSX.utils.book_new();

    combinedData.forEach(({ section, data }) => {
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, section);
    });

    XLSX.writeFile(wb, "AccountsCollections.xlsx");
  };

  const exportToCSV = () => {
    const combinedData = [
      { section: "IPD Collection", data: ipdCollections },
      { section: "OPD Collection", data: opdCollections },
      { section: "Pharmacy Collection", data: pharmacyCollections },
      { section: "Lab Collection", data: labCollections },
      { section: "Additional Service Collection", data: additionalServiceCollection },
    ];

    let csvContent = "data:text/csv;charset=utf-8,";

    combinedData.forEach(({ section, data }) => {
      csvContent += `\n${section}\n`;
      if (data.length > 0) {
        const headers = Object.keys(data[0]).join(",");
        csvContent += `${headers}\n`;
        data.forEach((row) => {
          csvContent += `${Object.values(row).join(",")}\n`;
        });
      } else {
        csvContent += "No data available\n";
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "AccountsCollections.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
  const doc = new jsPDF();
  const combinedData = [
    { section: "IPD Collection", data: ipdCollections },
    { section: "OPD Collection", data: opdCollections },
    { section: "Pharmacy Collection", data: pharmacyCollections },
    { section: "Lab Collection", data: labCollections },
    { section: "Additional Service Collection", data: additionalServiceCollection },
  ];

  let isFirstPage = true;

  combinedData.forEach(({ section, data }) => {
    if (!isFirstPage) {
      doc.addPage(); // Add a new page only after the first section
    }
    isFirstPage = false;

    doc.setFontSize(16);
    doc.text(section, 14, 16);

    if (data.length > 0) {
      const tableData = data.map((row) => Object.values(row));
      const headers = [Object.keys(data[0])];
      doc.autoTable({
        head: headers,
        body: tableData,
        startY: 20,
      });
    } else {
      doc.text("No data available", 14, 20);
    }
  });

  doc.save("AccountsCollections.pdf");
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

  return (
    <>
      <div className="accounts-collections" >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            height: "fit-content",
            marginTop: "10px",
            marginBottom: "-10px",
          }}
        >
          <div className="accounts-heading">
            <h2>Collections</h2>
          </div>
          <div
            className="export-buttons"
            style={{ display: "flex", gap: "10px" }}
          >
            <button onClick={exportToExcel}>Excel</button>
            <button onClick={exportToCSV}>CSV</button>
            <button onClick={exportToPDF}>PDF</button>
          </div>
        </div>
        <hr className="am-h-line" style={{ marginBottom: "0" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className="accounts-tabs">
            {[
              "IPD",
              "OPD",
              "Pharmacy",
              "Lab",
              "Additional Service",
            ].map((tab) => (
              <div
                className={`single-tab ${activeTab === tab ? "active" : ""}`}
                style={{ height: "fit-content", margin: "auto 0" }}
                onClick={() => handleTabClick(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>
          <div className="date-filters" style={{ gap: "10px" }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
            <button
              onClick={handleSearch}
              className="search-button"
              style={{
                height: "fit-content",
                width: "fit-content",
                marginTop: "4px",
              }}
            >
              Search
            </button>
          </div>
        </div>

        <hr className="am-h-line" />

        <div className="total-amount" style={{ margin: "0" }}>
          <h4>Combined Total: ₹{calculateTotal()}</h4>
        </div>

        <div className="accounts-tab-content">
          {loading ? <Loader /> : renderTabContent()}
        </div>
      </div>
    </>
  );
};

export default AccountsCollections;
