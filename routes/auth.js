const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const connection = require('../config/database');

// User registration route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, bio, skills } = req.body;

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare JSON object for skills
    const skillsJSON = JSON.stringify(skills);

    // Insert the user data into the database
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password, role, bio, skills, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [name, email, hashedPassword, role, bio, skillsJSON]
    );

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// User login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Retrieve user data from the database
    const [user] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (user.length === 0 || !(await bcrypt.compare(password, user[0].password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.user = user[0]; // Omit the password
    res.json({ message: 'Login successful', user: req.session.user });
  } catch (error) {
    console.error('Error in login endpoint:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// User logout route
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;


// app.get("/login", (req, res) => {
//   if (req.session.user) {
//     res.send({ loggedIn: true, user: req.session.user });
//   } else {
//     res.send({ loggedIn: false });
//   }
// });



// router.get('/profile', (req, res) => {
//   if (req.session.user) {
//     res.json({
//       user: {
//         name: req.session.user.name,
//         email: req.session.user.email,
//         role: req.session.user.role,
//         bio: req.session.user.bio,
//         skills: req.session.user.skills,
//       },
//     });
//   } else {
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// });



