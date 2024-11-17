import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import "./styles/SideNav.css";

const SideNav = () => {
  return (
    <div className="sidenav">
      <h3>OPD RX</h3>
      <ul>
        <li>
          <Link to="">Profile</Link>
        </li>
        <li>
          <Link to="assign-medicine">Assign Medicine</Link>
        </li>
        <li>
          <Link to="add-allergy">Add Allergy</Link>
        </li>
        <li>
          <Link to="assign-test">Assign Tests</Link>
        </li>
        <li>
          <Link to="payments">Payments History</Link>
        </li>
        <li>
          <Link to="assessment">Assessment</Link>
        </li>
        <li>
          <Link to="follow-up">Follow Up</Link>
        </li>
      </ul>
    </div>
  );
};

export default SideNav;
