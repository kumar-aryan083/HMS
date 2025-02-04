import React, { useState, useEffect, useRef, useContext } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./styles/AssignTests.css";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";

const AssignTests = ({ opdId, toggleTestPopup, onAssign }) => {
  const { setNotification } = useContext(AppContext);
  const [testOptions, setTestOptions] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${environment.url}/api/tests/get-tests`, {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        });
        const data = await response.json();
        if (response.ok) {
          setTestOptions(data);
        }
      } catch (error) {
        console.error("Error fetching tests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const handleTestSelection = (testId) => {
    setSelectedTests((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId]
    );
  };

  const handleEditorChange = (value) => {
    setNotes(value);
  };

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);

    if (searchValue.trim() === "") {
      setFilteredTests([]);
    } else {
      setFilteredTests(
        testOptions.filter((test) =>
          test.name.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }
  };

  const handleAssignTests = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${environment.url}/api/opd/${opdId}/assign-tests`,
        {
          method: "POST",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify({ tests: selectedTests, notes, status }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setNotification(data.message);
        onAssign();
        toggleTestPopup();
      } else {
        setNotification("Error assigning tests");
      }
    } catch (error) {
      console.error("Error assigning tests:", error);
      setNotification("Error assigning tests");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assign-tests-container">
      <h2 className="assign-tests-title">Assign Tests</h2>
      {loading && <div className="loading">Loading...</div>}

      <div className="form-row fg-group">
        <div className="form-group">
          <h3 className="test-select">Search and Select Tests</h3>
          <input
            type="text"
            placeholder="Search for tests..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="test-search-input"
          />

          <div className="assign-tests-options">
            {filteredTests.map((test) => (
              <div key={test._id} className="assign-tests-option">
                <input
                  type="checkbox"
                  checked={selectedTests.includes(test._id)}
                  onChange={() => handleTestSelection(test._id)}
                />
                <label>{test.name}</label>
              </div>
            ))}
          </div>
        </div>
        <div className="status-container">
          <h3>Status</h3>
          <select
            className="status-dropdown"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Select Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Notes</label>
        <ReactQuill
          theme="snow"
          value={notes}
          onChange={setNotes}
          placeholder="Write notes about the assigned test..."
          modules={{
            toolbar: [
              // Text styles
              [{ header: [1, 2, 3, false] }], // Header sizes
              [{ font: [] }], // Font selection
              [{ size: ["small", false, "large", "huge"] }], // Font size

              // Formatting options
              ["bold", "italic", "underline", "strike"], // Text formatting
              [{ color: [] }, { background: [] }], // Text and background color
              [{ script: "sub" }, { script: "super" }], // Subscript / superscript
              ["blockquote", "code-block"], // Blockquote and code block

              // List and indentation
              [{ list: "ordered" }, { list: "bullet" }], // Ordered and unordered lists
              [{ indent: "-1" }, { indent: "+1" }], // Indentation
              [{ align: [] }], // Text alignment

              // Media and links
              ["link", "image", "video"], // Insert links, images, and videos

              // Miscellaneous
              ["clean"], // Remove formatting
            ],
          }}
          formats={[
            "header",
            "font",
            "size",
            "bold",
            "italic",
            "underline",
            "strike",
            "color",
            "background",
            "script",
            "blockquote",
            "code-block",
            "list",
            "bullet",
            "indent",
            "align",
            "link",
            "image",
            "video",
          ]}
        />
      </div>
      <button
        className="assign-tests-button"
        onClick={handleAssignTests}
        disabled={!selectedTests.length || !status || loading}
      >
        Assign Selected Tests
      </button>
    </div>
  );
};

export default AssignTests;
