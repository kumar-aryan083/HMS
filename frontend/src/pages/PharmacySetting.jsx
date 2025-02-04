import React, { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { Route, Routes, useNavigate } from "react-router-dom";
import PharmacySettingSideNav from "../components/pharmacy/PharmacySettingSideNav";
import AddInvoiceHeader from "../components/pharmacy/AddInvoiceHeader";
import AddTerms from "../components/pharmacy/AddTerms";
import SupplierList from "../components/pharmacy/SupplierList";
import CompanyList from "../components/pharmacy/CompanyList";
import CategoryList from "../components/pharmacy/CategoryList.jsx";
import UOMList from "../components/pharmacy/UOMList.jsx";
import ItemTypeList from "../components/pharmacy/ItemTypeList.jsx";
import TaxList from "../components/pharmacy/TaxList.jsx";
import MedicineList from "../components/pharmacy/MedicineList.jsx";
import SupplierBillList from "../components/pharmacy/SupplierBillList.jsx";
import InVoiceList from "../components/pharmacy/InvoiceList.jsx";
import PharmacyStatistics from "../components/pharmacy/PharmacyStatistics.jsx";
import PharmacyBilling from "../components/pharmacy/PharmacyBilling.jsx";
import PharmacyReports from "../components/pharmacy/PharmacyReports.jsx";

const PharmacySetting = () => {
  const nav = useNavigate();
  const { user, setNotification } = useContext(AppContext);

  useEffect(() => {
    document.title = "Pharmacy | HMS";
    if (!user || (user.role !== "admin" && user.role !== "pharmacy")) {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  return (
    <>
      <div className="full-opd-rx">
        <PharmacySettingSideNav />
        <div className="opd-rx-sideContent">
          <Routes>
            <Route path="supplier" element={<SupplierList />} />
            <Route path="company" element={<CompanyList />} />
            <Route path="category" element={<CategoryList />} />
            <Route path="uom" element={<UOMList />} />
            <Route path="itemType" element={<ItemTypeList />} />
            <Route path="tax" element={<TaxList />} />
            <Route path="medicine" element={<MedicineList />} />
            <Route path="supplier-bills" element={<SupplierBillList />} />
            <Route path="supplier-payment" element={<SupplierBillList />} />
            <Route path="invoice" element={<InVoiceList />} />
            <Route path="invoice-headers" element={<AddInvoiceHeader />} />
            <Route path="statistics" element={<PharmacyStatistics />} />
            <Route path="report" element={<PharmacyReports />} />
            <Route path="t&c" element={<AddTerms />} />
            <Route path="billings" element={<PharmacyBilling />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default PharmacySetting;
