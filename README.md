## Hospital Management System (HMS)

This is a full-stack Hospital Management System that helps manage various hospital operations, including OPD, IPD, doctor management, patient admission, payments, and staff attendance tracking, pharmacy, laboratory. The system allows administrators to oversee and manage hospital functionalities efficiently.

### Deployment:

The application is deployed and accessible at:  http://122.160.138.35:3013/

### Features:

- **OPD & IPD Management:** Track outpatient and inpatient department details, including doctor appointments and room allocations.
- **Doctor & Staff Management:** Store and manage doctor details, specializations, availability, and staff attendance.
- **Payment & Billing:** Handle patient billing, track earnings per doctor, and manage store vendor bills.
- **Accounts Section:** Keep records of financial transactions and hospital expenses.
- **Pharmacy & Laboratory Section:** Store and manage medicines and lab tests along with it's billing.
- **Room Allocation:** Assign patients to available rooms based on preconfigured settings.
- **Attendance Tracking:** HR can track staff leaves and attendance.
- **Role based access:** Implemented role based access to the different sections for counter, admin, nurse, staffs, pharmacy and laboratory.

### Tech Stack:

- **Frontend:** React, HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Other Technologies:** Docker, Git/Github, VS Code

### Getting Started:

1. Clone the repository locally:
   ```sh
   git clone https://github.com/kumar-aryan083/HMS.git
   ```
2. Create an `.env` file in both `client` and `server` directories, following the `.env.example`.
3. Install dependencies:
   ```sh
   npm install
   cd client && npm install
   ```
4. Start the application:
   ```sh
   npm run dev  # Start client
   npm start    # Start server
   ```

### Contributions:

Contributions are welcome! If you encounter any issues or have suggestions for improvements, feel free to open an issue or submit a pull request on GitHub.
