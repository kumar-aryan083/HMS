import React from 'react';

const Rooms = () => {
  return (
    <>
      <div className="upper-wing">
        <h2>Rooms</h2>
        <button onClick={() => setIsModalOpen(true)}>Add Room</button>
      </div>
    </>
  );
}

export default Rooms;
