import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TeamWorkspace from './pages/TeamWorkspace';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import CreateProject from './pages/createproject';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" exact element={<Register />} />
          <Route path="/login" exact element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/teamworkspace/:projectId" element={<TeamWorkspace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/createproject" element={<CreateProject />} />
          {/* ... Add more routes for other components/pages as needed */}
          {/* Default route for handling unknown paths */}
          <Route path="*" element={<h1>Page Not Found</h1>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
