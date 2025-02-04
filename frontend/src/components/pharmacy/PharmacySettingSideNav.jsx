import React from 'react';
import { Link } from 'react-router-dom';

const PharmacySettingSideNav = () => {
  return (
    <>
      <div className="sidenav">
      <h3>Setting</h3>
      <ul>
        <li>
          <Link to="supplier" className="full-link">Supplier</Link>
        </li>
        <li>
          <Link to="supplier-bills" className="full-link">Suppliers Bills</Link>
        </li>
        {/* <li>
          <Link to="supplier-payment">Suppliers Payment</Link>
        </li> */}
        <li>
          <Link to="medicine" className="full-link">Medicine</Link>
        </li>
        <li>
          <Link to="company" className="full-link">Company</Link>
        </li>
        <li>
          <Link to="category" className="full-link">Category</Link>
        </li>
        <li>
          <Link to="uom" className="full-link">UOM</Link>
        </li>
        <li>
          <Link to="itemType" className="full-link">Item Type</Link>
        </li>
        <li>
          <Link to="invoice" className="full-link">Invoices</Link>
        </li>
        <li>
          <Link to="statistics" className="full-link">Statistics</Link>
        </li>
        <li>
          <Link to="report" className="full-link">Reports</Link>
        </li>
        <li>
          <Link to="billings" className="full-link">Billings</Link>
        </li>
        {/* <li>
          <Link to="item">Item</Link>
        </li> */}
        {/* <li>
          <Link to="tax">Tax</Link>
        </li> */}
        {/* <li>
          <Link to="generic">Generic</Link>
        </li>
        <li>
          <Link to="dispensary">Dispensary</Link>
        </li>
        <li>
          <Link to="rack">Rack</Link>
        </li> */}
        {/* <li>
          <Link to="invoice-headers">Invoice Headers</Link>
        </li>
        <li>
          <Link to="t&c">Terms & Conditions</Link>
        </li> */}
      </ul>
    </div>
    </>
  );
}

export default PharmacySettingSideNav;
