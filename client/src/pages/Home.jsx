import React, { useEffect } from 'react';

const Home = () => {
  useEffect(()=>{
    document.title = "Home | HMS";
  },[])
  return (
    <>
      Home page
    </>
  );
}

export default Home;