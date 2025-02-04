import React, { useState, useEffect } from "react";
import "./styles/EditInvestigationPopup.css";
import { environment } from "../../../utlis/environment.js";

const EditInvestigationPopup = ({ investigation, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: investigation.name || "",
    status: investigation.status || "",
    dateTime: investigation.dateTime || "",
  });

  const [allTests, setAllTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);

  // Fetch test names on component mount
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
          setAllTests(data.labTests);
        } else {
          console.error("Failed to fetch tests:", data.message);
        }
      } catch (error) {
        console.error("Error fetching tests:", error);
      }
    };
    fetchTests();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "name" && value.length > 2) {
      // Filter suggestions based on input
      const suggestions = allTests.filter((test) =>
        test.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTests(suggestions);
    } else {
      setFilteredTests([]);
    }
  };

  const handleTestSelect = (testName) => {
    setFormData({ ...formData, name: testName });
    setFilteredTests([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ ...investigation, ...formData });
    onClose();
  };

  return (
    <div className="edit-investigation-popup">
      <div className="edit-investigation-popup-content">
        <button className="edit-investigation-close-btn" onClick={onClose}>
          X
        </button>
        <h2>Edit Investigation</h2>
        <form onSubmit={handleSubmit} className="edit-investigation-form">
          <div className="form-row fg-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Type to search..."
              autoComplete="off"
            />
            {filteredTests.length > 0 && (
              <ul className="lab-search-suggestions">
                {filteredTests.map((test) => (
                  <li
                    key={test._id}
                    className="lab-suggestion-item"
                    onClick={() => handleTestSelect(test.name)}
                  >
                    {test.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-row fg-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>
          <div className="form-row fg-group">
            <label htmlFor="dateTime">Date and Time</label>
            <input
              type="datetime-local"
              id="dateTime"
              name="dateTime"
              value={formData.dateTime}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="edit-investigation-save-btn">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditInvestigationPopup;
