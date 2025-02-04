import React, { useState, useEffect } from 'react';
import './styles/AttendanceTable.css';

const AttendanceTable = ({ attendance = [], onUpdate, selectedMonth }) => {
  const [modalData, setModalData] = useState(null);
  const [leaveNotes, setLeaveNotes] = useState(''); // State for storing leave notes
  const [attendanceMap, setAttendanceMap] = useState({}); // Map to store attendance by date

  // Format the attendance data into a map
  useEffect(() => {
    if (Array.isArray(attendance)) {
      const map = {};
      attendance.forEach(item => {
        const date = new Date(item.date).toISOString().split('T')[0]; // Format to YYYY-MM-DD
        map[date] = { status: item.status, note: item.note };
      });
      setAttendanceMap(map);
    } else {
      console.error('Attendance data is not an array:', attendance);
    }
  }, [attendance]);

  // Handle cell click to open modal with current status
  const handleCellClick = (date) => {
    const currentStatus = attendanceMap[date]?.status || 'Present'; // Default to 'P' if no status exists
    setModalData({ date, status: currentStatus });
    setLeaveNotes(attendanceMap[date]?.note || ''); // Set leave notes if available
  };

  // Close the modal
  const closeModal = () => setModalData(null);

  // Handle saving the status update
  const handleSave = () => {
    // Send data with leave notes if available
    const updatedData = { 
      date: modalData.date, 
      status: modalData.status, 
      note: modalData.status === 'Leave' ? leaveNotes : '' 
    };
    onUpdate(updatedData); // Send updated data to parent
    closeModal();
  };

  // Generate days for the month and fill with status values
  const generateDays = () => {
    const days = [];
    const [year, month] = selectedMonth.split('-');
    const totalDays = new Date(year, month, 0).getDate(); // Get the total number of days in the selected month

    // Loop through each day of the month and display its status
    for (let i = 1; i <= totalDays; i++) {
      const date = `${selectedMonth}-${String(i).padStart(2, '0')}`;
      const status = attendanceMap[date]?.status || 'P'; // Get the status or default to 'P'

      // Determine the content and class for the status
      let cellContent = '';
      let statusClass = '';

      if (status === 'Present') {
        cellContent = 'P';
        statusClass = 'present';
      } else if (status === 'Absent') {
        cellContent = 'A';
        statusClass = 'absent';
      } else if (status === 'Leave') {
        cellContent = 'L';
        statusClass = 'leave';
      }

      days.push(
        <td
          key={date}
          onClick={() => handleCellClick(date)} // Allow clicking on any day to update status
          className={`status-cell ${statusClass}`} // Add class for styling
        >
          {cellContent}
        </td>
      );
    }
    return days;
  };

  return (
    <div className="attendance-table-container">
      <table className="attendance-table">
        <thead>
          <tr>
            <th>Date</th>
            {Array.from({ length: 31 }).map((_, i) => (
              <th key={i}>{i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Status</td>
            {generateDays()}
          </tr>
        </tbody>
      </table>

      {modalData && (
        <div className="modal">
          <h3>Update Attendance</h3>
          <p>Date: {modalData.date}</p>
          <select
            value={modalData.status}
            onChange={(e) => setModalData({ ...modalData, status: e.target.value })}
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Leave">Leave</option>
          </select>

          {/* Show leave notes input only if the status is 'Leave' */}
          {modalData.status === 'Leave' && (
            <div>
              <label htmlFor="leaveNotes">Leave Notes</label>
              <textarea
                id="leaveNotes"
                value={leaveNotes}
                onChange={(e) => setLeaveNotes(e.target.value)}
                placeholder="Enter reason for leave..."
              />
            </div>
          )}

          <button onClick={handleSave}>Save</button>
          <button onClick={closeModal}>Close</button>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;
