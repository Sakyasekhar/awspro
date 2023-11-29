import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import "../styles/navbar.css";

const Navbar = () => {
  const { user } = useUser();

  return (
    <nav className="navbar"> 
      <h1>Freelancer Connect</h1> 
      <div className="links">
      <Link to="/home" className="button">Home</Link>
        <Link to="/projects" className="button">Projects</Link>
        <Link to="/createproject" className="button">Create project</Link>
        <Link to="/profile" className="button">Profile</Link>
        {user && <p>Welcome, {user.username}!</p>}
        
        <Link className="logout-link" to="/">Log out</Link>
      </div>
    </nav>
  );
};

export default Navbar;
