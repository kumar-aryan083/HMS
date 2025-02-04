import React from 'react';
import { Link } from 'react-router-dom';

const LabSettingSideNav = () => {
  return (
    <>
      <div className="sidenav">
      <h3>Laboratory</h3>
      <ul>
        <li>
          <Link to="lab-test"  className="full-link">Lab Test</Link>
        </li>
        <li>
          <Link to="lab-test-component"  className="full-link">Lab Test Component</Link>
        </li>
        <li>
          <Link to="lab-report-template"  className="full-link">Report Template</Link>
        </li>
        <li>
          <Link to="lab-category"  className="full-link">Category</Link>
        </li>
        <li>
          <Link to="lab-lookup"  className="full-link">LookUps</Link>
        </li>
        <li>
          <Link to="lab-vendor"  className="full-link">Vendors</Link>
        </li>
        <li>
          <Link to="lab-test-report"  className="full-link">Test Report</Link>
        </li>
        <li>
          <Link to="lab-invoices"  className="full-link">Invoices</Link>
        </li>
        <li>
          <Link to="lab-reports"  className="full-link">Bills Report</Link>
        </li>
        <li>
          <Link to="lab-billings" className="full-link">Billings</Link>
        </li>
      </ul>
    </div>
    </>
  );
}

export default LabSettingSideNav;
