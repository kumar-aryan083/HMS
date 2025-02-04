import React from 'react';
import { Link } from 'react-router-dom';

const StaffManagementSidenav = () => {
  return (
    <>
      <div className="sidenav">
      <h3>Staff Management</h3>
      <ul>
        <li>
          <Link to="attendence"  className="full-link">Attendance</Link>
        </li>
        <li>
          <Link to="staff-expense"  className="full-link">Staff Expense</Link>
        </li>
      </ul>
    </div>
    </>
  );
}

export default StaffManagementSidenav;
