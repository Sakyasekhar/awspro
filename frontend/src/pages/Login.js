import React, { useState } from 'react';
import "../styles/Login.css";
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import { createBrowserHistory } from 'history'; // Import createBrowserHistory
const history = createBrowserHistory();

const Login = () => {
  const { loginUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', { email, password });

      console.log('Login successful!', response.data);

      // Save user data to context
      loginUser(response.data);

      // Redirect to the home page using history
      // history.push('/home');
      localStorage.setItem('user', JSON.stringify(response.data ));
      window.location.href = '/home';
    } catch (error) {
      console.error('Login failed:', error.message);
      setErrorMessage('Invalid login credentials');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
        />

        <button type="button" onClick={handleLogin} className="login-button">
          Login
        </button>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <p className="login-link">
          Don't have an account? <Link to="/">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;