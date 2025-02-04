import React from "react";
import { Link } from "react-router-dom";

const AccountsSideNav = () => {
  return (
    <>
      <div className="sidenav">
        <h3>Accounts</h3>
        <ul>
          <li>
            <Link to="accounts-income-report"  className="full-link">Bills Report</Link>
          </li>
          <li>
            <Link to="accounts-item-wise"  className="full-link">Item wise report</Link>
          </li>
          <li>
            <Link to="accounts-collections"  className="full-link">Collections</Link>
          </li>
          <li>
            <Link to="accounts-expenses"  className="full-link">Expenses</Link>
          </li>
          <li>
            <Link to="discount-report"  className="full-link">Discount Report</Link>
          </li>
          <li>
            <Link to="referal-report"  className="full-link">Referal Report</Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default AccountsSideNav;
