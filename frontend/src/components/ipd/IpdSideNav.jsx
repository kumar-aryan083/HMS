import React from 'react';
import { Link } from 'react-router-dom';

const IpdSideNav = () => {
  return (
    <>
      <div className="sidenav">
      <h3>IPD File</h3>
      <ul>
        <li>
          <Link to="" className="full-link">Profile</Link>
        </li>
        <li>
          <Link to="physical-examination" className="full-link">Physical Examinations</Link>
        </li>
        <li>
          <Link to="consumables" className="full-link">Consumables</Link>
        </li>
        <li>
          <Link to="discharge-summary" className="full-link">Discharge Summary</Link>
        </li>
        <li>
          <Link to="investigations" className="full-link">Investigations</Link>
        </li>
        <li>
          <Link to="chief-complaints" className="full-link">Chief Complaints</Link>
        </li>
        <li>
          <Link to="chemo-notes" className="full-link">Chemo Notes</Link>
        </li>
        <li>
          <Link to="allergies" className="full-link">Allergies</Link>
        </li>
        <li>
          <Link to="visit-notes" className="full-link">Visit Notes</Link>
        </li>
        <li>
          <Link to="obs-gynae" className="full-link">Obs & Gynae</Link>
        </li>
        <li>
          <Link to="ward-history" className="full-link">Ward History</Link>
        </li>
        <li>
          <Link to="ipd-billing" className="full-link">Billings</Link>
        </li>
        {/* <li>
          <Link to="ipd-stats">Statistics</Link>
        </li> */}
      </ul>
    </div>
    </>
  );
}

export default IpdSideNav;
