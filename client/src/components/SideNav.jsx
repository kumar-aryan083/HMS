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
        {/* <li>
          <Link to="/opd/payments">Payments</Link>
        </li>
        <li>
          <Link to="/opd/assessment">Assessment</Link>
        </li>
        <li>
          <Link to="/opd/diagnosis">Diagnosis</Link>
        </li>
        <li>
          <Link to="/opd/treatment">Treatment</Link>
        </li>
        <li>
          <Link to="/opd/follow-up">Follow Up</Link>
        </li> */}
      </ul>
    </div>
  );
};

export default SideNav;