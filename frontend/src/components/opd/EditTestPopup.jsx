import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { environment } from "../../../utlis/environment";
import "./styles/EditTestPopup.css";

const EditTestPopup = ({ test, onClose, onUpdate }) => {
  const [testId, setTestId] = useState(test?.testId?._id || "");
  const [status, setStatus] = useState(test?.status || "");
  const [notes, setNotes] = useState(test?.notes || "");
  const [loading, setLoading] = useState(false);
  const [testOptions, setTestOptions] = useState([]); // Store test options
  const [searchQuery, setSearchQuery] = useState(""); // Search query for filtering tests
  const [filteredTests, setFilteredTests] = useState([]);

  // Fetch tests when the component mounts or searchQuery changes
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

  // Update filteredTests based on searchQuery (only when length > 2)
  useEffect(() => {
    if (searchQuery.length > 2) {
      setFilteredTests(
        testOptions.filter((test) =>
          test.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredTests([]); // Hide suggestions if searchQuery is less than 3 characters
    }
  }, [searchQuery, testOptions]);

  const handleTestSelection = (selectedTest) => {
    setTestId(selectedTest._id);
    setSearchQuery(""); // Clear search after selection
    setFilteredTests([]); // Hide suggestions after selection
  };

  const handleUpdateTest = async () => {
    const updatedBody = {
      ...test,
      testId,
      status,
      notes,
    };
    onUpdate(updatedBody);
  };

  return (
    <div className="edit-test-popup">
      <div className="edit-test-popup-content">
        <button className="opd-closeBtn" onClick={onClose}>
          X
        </button>
        <h2>Edit Test</h2>

        {loading && <div className="loading">Loading...</div>}

        {/* Test Name Search Input */}
        <div className="form-group fg-group">
          <label>Test Name</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update search query
            placeholder="Search Test"
          />
          {/* Display suggestions only when there are matching tests and searchQuery > 2 characters */}
          {searchQuery.length > 2 && filteredTests.length > 0 && (
            <div className="med-search-suggestions">
              {filteredTests.map((test) => (
                <div
                  key={test._id}
                  className="med-suggestion-item"
                  onClick={() => handleTestSelection(test)}
                >
                  {test.name}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Status Dropdown */}
        <div className="form-group fg-group">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Select Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <ReactQuill
            theme="snow"
            value={notes}
            onChange={setNotes}
            placeholder="Write notes about the test..."
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
        {/* Save Button */}
        <div className="form-group">
          <button
            className="save-button"
            onClick={handleUpdateTest}
            disabled={loading || !testId || !status}
          >
            <FontAwesomeIcon icon={faSave} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTestPopup;
