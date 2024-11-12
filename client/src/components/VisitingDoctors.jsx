import React from 'react';

const VisitingDoctors = () => {
  return (
    <>
      <div className="upper-wing">
        <h2>Visiting Doctors</h2>
        <button onClick={() => setIsModalOpen(true)}>Add Visiting Doctors</button>
      </div>
    </>
  );
}

export default VisitingDoctors;
