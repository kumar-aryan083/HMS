import React from 'react';

const NursingRates = () => {
  return (
    <>
      <div className="upper-wing">
        <h2>Nursing Rates</h2>
        <button onClick={() => setIsModalOpen(true)}>Add Nursing</button>
      </div>
    </>
  );
}

export default NursingRates;
