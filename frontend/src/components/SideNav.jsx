import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import "./styles/SideNav.css";

const SideNav = () => {
  return (
    <div className="sidenav">
      <h3>OPD RX</h3>
      <ul>
        <li>
          <Link to="" className="full-link">Profile</Link>
        </li>
        <li>
          <Link to="assign-medicine" className="full-link">Assign Medicine</Link>
        </li>
        <li>
          <Link to="add-allergy" className="full-link">Add Allergy</Link>
        </li>
        <li>
          <Link to="assign-test" className="full-link">Assign Tests</Link>
        </li>
        <li>
          <Link to="assessment" className="full-link">Assessment</Link>
        </li>
        <li>
          <Link to="follow-up" className="full-link">Follow Up</Link>
        </li>
        <li>
          <Link to="billings" className="full-link">Billings</Link>
        </li>
        {/* <li>
          <Link to="opd-stats">Statistics</Link>
        </li> */}
      </ul>
    </div>
  );
};

export default SideNav;
