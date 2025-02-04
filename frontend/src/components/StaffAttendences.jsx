import React, { useContext, useState } from "react";
import SearchBar from "./SearchBar";
import AttendanceTable from "./AttendanceTable";
import "./styles/StaffAttendences.css";
import { environment } from "../../utlis/environment";
import { AppContext } from "../context/AppContext";

const StaffAttendences = () => {
  const { setNotification } = useContext(AppContext);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [attendance, setAttendance] = useState({});

  // Fetch attendance data from the backend
  const fetchAttendanceData = async (staffId, month, staffRole) => {
    try {
      const res = await fetch(`${environment.url}/api/common/get-staff-attendence?staffId=${staffId}&staffRole=${staffRole}&month=${month}`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      if (res.ok) {
        const data = await res.json();
        // console.log("attendence data", data);
        setAttendance(data.monthAttendance); // Update the state with the fetched data
      } else {
        setNotification("Failed to fetch attendance data.");
      }
    } catch (error) {
      console.log(error);
      setNotification("An error occurred while fetching attendance data.");
    }
  };

  const handleSearch = (staff, month) => {
    // console.log("selected staff", staff);
    // console.log("selected month", month);
    setSelectedStaff(staff);
    setSelectedMonth(month);

    // Fetch attendance data for the selected staff and month
    fetchAttendanceData(staff._id, month, staff.role); // Pass the staff's ID and selected month
  };

  const updateAttendance = async (updatedAttendance) => {
    // console.log(updatedAttendance);
    const updatedData = {
      ...updatedAttendance,
      staffId: selectedStaff._id,
      staffRole: selectedStaff.role,
    };
    // console.log("updated attendance", updatedData);
    try {
      const res = await fetch(
        `${environment.url}/api/common/staff-attendence`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(updatedData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        fetchAttendanceData(selectedStaff._id, selectedMonth, selectedStaff.role);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    }
    setAttendance((prev) => ({
      ...prev,
      [updatedData.date]: updatedData.status,
    }));
  };

  return (
    <div className="app">
      <h1>Staff Attendance Management</h1>
      <h2 style={{margin: "0"}}>Select Staff and month:</h2>
      <SearchBar onSearch={handleSearch} />
      {selectedStaff && selectedMonth && (
        <>
          <AttendanceTable
            attendance={attendance}
            onUpdate={updateAttendance}
            selectedMonth={selectedMonth}
          />
          {/* <div style={{ display: "flex", marginTop: "15px" }}>
            <button
              onClick={sendAttendanceToBackend}
              style={{ width: "fit-content", margin: "0 auto" }}
            >
              Update Attendance
            </button>
          </div> */}
        </>
      )}
    </div>
  );
};

export default StaffAttendences;
