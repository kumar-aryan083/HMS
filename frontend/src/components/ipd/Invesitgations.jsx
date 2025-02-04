import React, { useContext, useEffect, useState } from "react";
import "./styles/Investigations.css";
import { AppContext } from "../../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";
import { environment } from "../../../utlis/environment.js";

const Investigations = ({
  admissionId,
  toggleInvestigationPopup,
  onAssign,
}) => {
  const nav = useNavigate();
  const { setNotification } = useContext(AppContext);

  // Initial state for form data
  const [formData, setFormData] = useState({
    labTests: [],
    updatedAt: new Date(),
  });

  // State to handle individual inputs
  const [testName, setTestName] = useState("");
  const [testDateTime, setTestDateTime] = useState("");
  const [testStatus, setTestStatus] = useState("Pending");
  const [testReport, setTestReport] = useState("");

  // State for test suggestions
  const [allTests, setAllTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);

  // Fetch all available tests on component mount
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch(`${environment.url}/api/lab/get-lab-tests`, {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            token: localStorage.getItem("token"),
          },
        });
        const data = await response.json();
        if (response.ok) {
          // console.log(data);
          setAllTests(data.labTests);
        }
      } catch (error) {
        console.error("Error fetching tests:", error);
        setNotification("Error fetching tests.");
      }
    };
    fetchTests();
  }, [setNotification]);

  // Handle input change for test name
  const handleTestInputChange = (e) => {
    const value = e.target.value;
    setTestName(value);
    // console.log(testName)
    // Filter suggestions based on the input
    if (value.length > 2) {
      const suggestions = allTests.filter((test) =>
        test.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTests(suggestions);
    } else {
      setFilteredTests([]);
    }
  };

  // Handle selecting a test from suggestions
  const handleTestSelect = (test) => {
    setTestName(test.name);
    setFilteredTests([]);
  };

  // Handle adding a test
  const handleAddTest = (e) => {
    e.preventDefault();
    if (testName && testDateTime && testStatus) {
      setFormData((prevState) => ({
        ...prevState,
        labTests: [
          ...prevState.labTests,
          {
            name: testName,
            dateTime: testDateTime,
            status: testStatus,
            report: testReport || "",
          },
        ],
      }));
      // Reset input fields
      setTestName("");
      setTestDateTime("");
      setTestStatus("Pending");
      setTestReport("");
      setFilteredTests([]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // console.log(formData);
      const response = await fetch(
        `${environment.url}/api/ipd/${admissionId}/investigations`,
        {
          method: "PATCH",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setNotification(data.message);
        onAssign();
        toggleInvestigationPopup();

        // nav(`/ipds/ipd-file/${admissionId}`);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error("Error updating investigations:", error);
      setNotification("Failed to update investigations.");
    }
  };

  return (
    <div className="investigations-ipd-container">
      <form className="investigations-ipd-form" onSubmit={handleSubmit}>
        <h3 className="form-title">Investigations</h3>
        <div className="form-group">
          <label className="form-label" htmlFor="testName">
            Lab Test Name
          </label>
          <input
            type="text"
            id="testName"
            className="form-input"
            placeholder="(e.g., Blood Test)"
            value={testName}
            onChange={handleTestInputChange}
          />
          {filteredTests.length > 0 && (
            <ul className="lab-search-suggestions">
              {filteredTests.map((test) => (
                <li
                  key={test._id}
                  className="lab-suggestion-item"
                  onClick={() => handleTestSelect(test)}
                >
                  {test.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="testDateTime">
              Date & Time of Test
            </label>
            <input
              type="datetime-local"
              id="testDateTime"
              className="form-input"
              value={testDateTime}
              onChange={(e) => setTestDateTime(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="testStatus">
              Status
            </label>
            <select
              id="testStatus"
              className="form-input"
              value={testStatus}
              onChange={(e) => setTestStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <button
            type="button"
            className="add-test-btn"
            onClick={handleAddTest}
          >
            Add Lab Test
          </button>
        </div>

        {formData.labTests.length > 0 && (
          <div className="test-preview">
            <h4 className="preview-title">Tests to be Submitted</h4>
            <table className="test-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Report</th>
                </tr>
              </thead>
              <tbody>
                {formData.labTests.map((test, index) => (
                  <tr key={index}>
                    <td>{test.name}</td>
                    <td>{new Date(test.dateTime).toLocaleString()}</td>
                    <td>{test.status}</td>
                    <td>{test.report || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="form-group">
          <button type="submit" className="form-button" style={{margin: "0"}}>
            Submit Investigations
          </button>
        </div>
      </form>
    </div>
  );
};

export default Investigations;
