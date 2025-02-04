import React, { useContext, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import AccountsSideNav from "../components/accounts/AccountsSideNav";
import AccountsCollections from "../components/accounts/AccountsCollections";
import AccountsIncomeReport from "../components/accounts/AccountsIncomeReport";
import AccountsExpenses from "../components/accounts/AccountsExpenses";
import ItemWiseReports from "../components/accounts/ItemWiseReports";
import DiscountReports from "../components/accounts/DiscountReports";
import ReferralReport from "../components/accounts/ReferalReport";

const Accounts = () => {
  const nav = useNavigate();
  const { user, setNotification } = useContext(AppContext);

  useEffect(() => {
    document.title = "Accounts | HMS";
    if (!user || user.role !== "admin") {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);
  return (
    <>
      <div className="full-opd-rx">
        <AccountsSideNav />
        <div className="opd-rx-sideContent">
          <Routes>
            <Route
              path="accounts-income-report"
              element={<AccountsIncomeReport />}
            />
            <Route path="accounts-item-wise" element={<ItemWiseReports />} />
            <Route path="accounts-collections" element={<AccountsCollections />} />
            <Route path="accounts-expenses" element={<AccountsExpenses />} />
            <Route path="referal-report" element={<ReferralReport />} />
            <Route path="discount-report" element={<DiscountReports />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default Accounts;
