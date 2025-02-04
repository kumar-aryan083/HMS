import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });

  const [message, setMessage] = useState("");
  const setNotification = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  const newUser = (currUser) => {
    // console.log(currUser);
    setUser(currUser);
    const u = JSON.stringify(currUser);
    localStorage.setItem("user", u);
  };

  return (
    <AppContext.Provider value={{user, setNotification, newUser, message}}>
        {children}
    </AppContext.Provider>
  );
};
