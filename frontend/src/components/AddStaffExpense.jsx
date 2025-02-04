import React, { useState } from "react";

const AddStaffExpense = ({ onClose, onAddExpense, staffList }) => {
  const [form, setForm] = useState({
    type: "TA", // Default value as per the `enum`
    amount: "",
    note: "",
    date: "",
    staffId: "", // Added staffId to the form state
    staffRole: "", // Added staffRole to the form state
  });
  const [staff, setStaff] = useState(""); 
  const [filteredStaff, setFilteredStaff] = useState([]); // Store filtered suggestions

  // Handle input changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleStaffChange = (e) => {
    const input = e.target.value;
    setStaff(input);

    // Filter staff when user types more than 2 characters
    if (input.length > 2) {
      const filtered = staffList.filter((staffMember) =>
        staffMember.name.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredStaff(filtered);
    } else {
      setFilteredStaff([]); // Clear suggestions when input length is less than 3
    }
  };

  // Handle staff selection from the suggestions
  const handleStaffSelect = (selectedStaff) => {
    setStaff(selectedStaff.name); // Set selected staff name in input
    setForm({
      ...form,
      staffId: selectedStaff._id, // Add staffId to the form state
      staffRole: selectedStaff.role, // Add staffRole to the form state
    });
    setFilteredStaff([]); // Clear suggestions after selection
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onAddExpense(form);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ height: "auto" }}>
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3>Add Staff Expense</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Date:</label>
              <input
                className="form-input"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Type:</label>
              <select
                className="form-input"
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="TA">TA</option>
                <option value="DA">DA</option>
                <option value="HRA">HRA</option>
                <option value="Bonus">Bonus</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
                <label>Staff</label>
              <input
                type="text"
                placeholder="Search staff by name..."
                value={staff}
                onChange={handleStaffChange}
              />
              {filteredStaff.length > 0 && (
                <div className="attendence-suggestions">
                  {filteredStaff.map((staffMember) => (
                    <div
                      key={staffMember.id} // Assuming each staff has a unique ID
                      className="attendence-suggestion-item"
                      onClick={() => handleStaffSelect(staffMember)}
                    >
                      {staffMember.name} ({staffMember.phone || "N/A"})
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Amount Input */}
            <div className="form-group">
              <label>Amount:</label>
              <input
                className="form-input"
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Enter amount"
              />
            </div>
          </div>

          {/* Note Input */}
          <div className="form-group">
            <label>Note:</label>
            <textarea
              className="form-input"
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Add any additional notes"
              rows="2"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button type="submit">Add Expense</button>
        </form>
      </div>
    </div>
  );
};

export default AddStaffExpense;
