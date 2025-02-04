import React, { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { Route, Routes, useNavigate } from "react-router-dom";
import StoreItemList from "../components/storeItem/StoreItemList";
import StoreSideNav from "../components/storeItem/StoreSideNav";
import StoreCategories from "../components/storeItem/StoreCategories";
import StoreRecievers from "../components/storeItem/StoreRecievers";
import StoreVendors from "../components/storeItem/StoreVendors";
import StoreSupplies from "../components/storeItem/StoreSupplies";
import StorePurchases from "../components/storeItem/StorePurchases";
import StoreBillings from "../components/storeItem/StoreBillings";

const StoreSetting = () => {
  const nav = useNavigate();
  const { user, setNotification } = useContext(AppContext);

  useEffect(() => {
    document.title = "Store Management | HMS";
    if (!user || (user.role !== "admin" && user.role !== "store")) {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  return (
    <>
      <div className="full-opd-rx">
        <StoreSideNav />
        <div className="opd-rx-sideContent">
          <Routes>
            <Route path="store-categories" element={<StoreCategories />} />
            <Route path="store-reciever" element={<StoreRecievers />} />
            <Route path="store-vendor" element={<StoreVendors />} />
            <Route path="store-items" element={<StoreItemList />} />
            <Route path="store-supply" element={<StoreSupplies />} />
            <Route path="store-purchases" element={<StorePurchases />} />
            <Route path="store-billings" element={<StoreBillings />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default StoreSetting;
