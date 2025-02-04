import React from 'react';
import { Link } from 'react-router-dom';

const AdditionalSideNav = () => {
  return (
    <>
      <div className="sidenav">
      <h3>Additional</h3>
      <ul>
        <li>
          <Link to="services"  className="full-link">Additional Services</Link>
        </li>
        <li>
          <Link to="service-bill"  className="full-link">Service Bill</Link>
        </li>
        <li>
          <Link to="birth-certificates"  className="full-link">Birth Certificates</Link>
        </li>
      </ul>
    </div>
    </>
  );
}

export default AdditionalSideNav;
