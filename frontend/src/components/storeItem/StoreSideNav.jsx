import React from 'react';
import { Link } from 'react-router-dom';

const StoreSideNav = () => {
  return (
    <>
      <div className="sidenav">
      <h3>Store</h3>
      <ul>
        <li>
          <Link to="store-categories" className="full-link">Category</Link>
        </li>
        <li>
          <Link to="store-reciever" className="full-link">Reciever</Link>
        </li>
        <li>
          <Link to="store-vendor" className="full-link">Vendor</Link>
        </li>
        <li>
          <Link to="store-items" className="full-link">Store Items</Link>
        </li>
        <li>
          <Link to="store-supply" className="full-link">Supply</Link>
        </li>
        <li>
          <Link to="store-purchases" className="full-link">Purchase Order</Link>
        </li>
        <li>
          <Link to="store-billings" className="full-link">Billings</Link>
        </li>
        {/* <li>
          <Link to="purchases">Purchases</Link>
        </li> */}
        {/* <li>
          <Link to="hospital-usables">Hospital Usables</Link>
        </li> */}
      </ul>
    </div>
    </>
  );
}

export default StoreSideNav;
