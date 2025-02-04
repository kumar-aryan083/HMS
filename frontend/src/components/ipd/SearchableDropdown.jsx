import React, { useState, useEffect, useCallback } from "react";
import { environment } from "../../../utlis/environment";

const SearchableDropdown = ({
  billType,
  setForm,
  form,
  setShowRailwayCode,
  patientType,
  railwayType,
  items,
}) => {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    setQuery("");
    if (form.itemName) {
      setForm((prev) => ({
        ...prev,
        itemName: "",
        charge: 0,
        itemId: "",
        railwayCode: "",
      }));
      setShowRailwayCode(false);
    }
  }, [items?.length]);

  // Utility function to debounce API calls
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch data based on the search term and billType
  const fetchData = async (searchTerm) => {
    if (!searchTerm) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      let response = null;
      if (billType === "ipd") {
        response = await fetch(
          `${environment.url}/api/ipd/get-all-ipds-items?name=${searchTerm}`,
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
      } else if (billType === "pharmacy") {
        response = await fetch(
          `${environment.url}/api/pharmacy/search-medicine?search=${searchTerm}`,
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
      } else if (billType === "labTest") {
        response = await fetch(
          `${environment.url}/api/lab/search-lab-tests?search=${searchTerm}`,
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
      } else if (billType === "all") {
        response = await fetch(
          `${environment.url}/api/ipd/get-all-type-items?name=${searchTerm}`,
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
      } else if (billType === "additionalService") {
        response = await fetch(
          `${environment.url}/api/additional-services/search-additional-services?search=${searchTerm}`,
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
      }

      if (response.ok) {
        const data = await response.json();
        // console.log("item in bill", data);
        if (
          billType === "ipd" ||
          billType === "labTest" ||
          billType === "all" ||
          billType === "additionalService"
        ) {
          // console.log("items: ", data.items);
          setOptions(data.items);
        } else if (billType === "pharmacy") {
          const filteredData = data.medicines.filter(
            (item) => item.pricePerUnit && item.batchNumber && item.expiryDate
          );
          setOptions(filteredData);
        }
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchData = useCallback(debounce(fetchData, 300), [billType]);

  // Handle input change and trigger fetch
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedFetchData(value);
  };

  // Handle option selection
  const handleOptionClick = (option) => {
    // console.log("selected option - ", option, patientType, railwayType);
    setSelectedOption(option);
    if (billType === "pharmacy" || option.expiryDate) {
      setQuery(`${option.name}(${option.companyName}/${option.expiryDate})`);
      setForm((prev) => ({
        ...prev,
        itemName: `${option.name}(${option.companyName}/${option.expiryDate})`,
        itemId: option._id,
        charge: option.pricePerUnit,
        itemCategory: option.itemCategory,
      }));
    } else {
      // console.log("selected option", option);
      // console.log("selected option patient type", patientType);
      // console.log("selected option railway type", railwayType);
      let calculatedCharge;
      // If billType is 'additionalService', set charge to generalFees
      if (billType === "additionalService") {
        calculatedCharge = option.generalFees || 0; // Default to 0 if generalFees is not available
      }
      // Check if patientType is 'railway'
      else if (patientType?.toLowerCase() === "railway") {
        // Check railwayType for 'nabh' or 'nonNabh'
        if (railwayType === "nabh") {
          calculatedCharge = option.nabhPrice || option.pricePerUnit;
        } else if (railwayType === "nonNabh") {
          calculatedCharge = option.nonNabhPrice || option.pricePerUnit;
        } else {
          // Fallback to a default price for railway if railwayType is not specified
          calculatedCharge = option.price || option.pricePerUnit;
        }
      } else {
        // For non-railway patients, find patientType in option.patientTypes array
        const patientTypeInfo = option.patientTypes?.find(
          (type) =>
            type.patientTypeName?.toLowerCase() === patientType?.toLowerCase()
        );

        if (patientTypeInfo) {
          // If patientType is found, set its generalFees
          calculatedCharge = patientTypeInfo.generalFees;
        } else {
          // If patientType is not found, fallback to 'general' fees
          const generalTypeInfo = option.patientTypes?.find(
            (type) => type.patientTypeName.toLowerCase() === "general"
          );

          calculatedCharge = generalTypeInfo
            ? generalTypeInfo.generalFees
            : option.generalFees || option.pricePerUnit;
        }
      }

      // Update the form state with the calculated charge and other properties
      setForm((prevForm) => ({
        ...prevForm,
        itemName: option.name,
        itemId: option._id,
        charge: calculatedCharge,
        railwayCode: option.railwayCode || "",
        itemCategory: option.itemCategory || "",
      }));

      // setForm((prevForm) => ({
      //   ...prevForm,
      //   itemName: option.name,
      //   itemId: option._id,
      //   charge:
      //     billType === "additionalService"
      //       ? option.generalFees
      //       : patientType === "nabh"
      //       ? option.nabhPrice || option.pricePerUnit
      //       : patientType === "nonNabh"
      //       ? option.nonNabhPrice || option.pricePerUnit
      //       : option.price,
      //   railwayCode: option.railwayCode || "",
      //   itemCategory: option.itemCategory || "",
      // }));
      setShowRailwayCode(!!option.railwayCode);
      setQuery(option.name);
    }
    setOptions([]); // Clear the dropdown
  };

  return (
    <div style={{ margin: "0px auto", position: "relative", width: "100%" }}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search..."
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "16px",
          boxSizing: "border-box",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      {loading && (
        <div style={{ marginTop: "8px", fontSize: "14px", color: "#555" }}>
          Loading...
        </div>
      )}
      {options.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: "0",
            width: "100%",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "4px",
            margin: "0",
            padding: "0",
            listStyleType: "none",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 1000, // Ensures it appears above other elements
          }}
        >
          {options.map((option) => (
            <li
              key={option._id}
              onClick={() => handleOptionClick(option)}
              style={{
                padding: "10px",
                cursor: "pointer",
                fontSize: "14px",
                borderBottom: "1px solid #eee",
                backgroundColor: "#fff",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#fff")}
            >
              {option.expiryDate === undefined
                ? option.name
                : `${option.name}(${option.companyName}/${option.expiryDate})`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchableDropdown;
