import React from 'react';
import { Link } from 'react-router-dom';

const IpdSideNav = () => {
  return (
    <>
      <div className="sidenav">
      <h3>IPD File</h3>
      <ul>
        <li>
          <Link to="">Profile</Link>
        </li>
        <li>
          <Link to="physical-examination">Physical Examinations</Link>
        </li>
        <li>
          <Link to="discharge-summary">Discharge Summary</Link>
        </li>
        <li>
          <Link to="investigations">Investigations</Link>
        </li>
        <li>
          <Link to="chief-complaints">Chief Complaints</Link>
        </li>
        <li>
          <Link to="chemo-notes">Chemo Notes</Link>
        </li>
        <li>
          <Link to="allergies">Allergies</Link>
        </li>
        <li>
          <Link to="visit-notes">Visit Notes</Link>
        </li>
        <li>
          <Link to="labour-records">Labour Record</Link>
        </li>
        <li>
          <Link to="obs-gynae">Obs & Gynae</Link>
        </li>
        <li>
          <Link to="payment-history">Payments History</Link>
        </li>
      </ul>
    </div>
    </>
  );
}

export default IpdSideNav;
