import React from 'react';
import Navbar from '../components/navbar'
import "../styles/Home.css";
const Home = () => {
  const userdetails = localStorage.getItem("user") !== undefined ? JSON.parse(localStorage.getItem("user")) : null;
  const name = userdetails.user.name;
  
  return (
    <div>
    <Navbar />
    <div className="home-container">
      <h1>Welcome Back, {name}!</h1>
      <p>Empowering collaboration for a brighter tomorrow.</p>
    </div>
    </div>
  );
};

export default Home;
