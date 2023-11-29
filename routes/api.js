const express = require('express');
const router = express.Router();
const connection = require('../config/database');
const multer = require('multer');
const upload = multer();
const filemanager = require('../models/aws'); // Import your AWS file manager
const Project = require('../models/Project');

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

// Fetch user profile data
router.get('/profile/:userid', async (req, res) => {
  const {userid} = req.params; // Assuming user ID is stored in the session
  try {
    const [profile] = await connection.query('SELECT name, email, bio, skills FROM users WHERE id = ?', [userid]);
    if (!profile.length) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile data
router.put('/profile/:userid', async (req, res) => {
  const {userid} = req.params;  // Assuming user ID is stored in the session
  const { name, bio, skills } = req.body;
  try {
    await connection.query('UPDATE users SET name = ?, bio = ?, skills = ? WHERE id = ?', [name, bio, JSON.stringify(skills), userid]);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Get project members
router.get('/projects/:projectId/members', async (req, res) => {
  const projectId = req.params.projectId;
  // console.log(projectId);

  const query = `
  SELECT u.id, u.name, u.email, u.bio, u.skills
  FROM users u
  JOIN project_members pm ON u.id = pm.user_id
  WHERE pm.project_id = ?;
`;

try {
  const [members] = await connection.query(query, [projectId]);
  res.json(members);
} catch (error) {
  console.error('Error executing query:', error.message);
  throw error;
}
});

// Endpoint to get shared files for a project
router.get('/projects/:projectId/files', async (req, res) => {
  const projectId = req.params.projectId;

  try {
    // Use your function to get a list of files for the project from S3
    const files = await filemanager.getFileInfoFromS3(projectId);
    res.json(files);
  } catch (error) {
    console.error('Error fetching shared files:', error.message);
    res.status(500).send('Error fetching shared files');
  }
});

// Endpoint to handle file downloads
// Endpoint to handle file downloads
router.get('/projects/:projectId/:sender/files/:fileId/download', async (req, res) => {
  const projectId = req.params.projectId;
  const sender = req.params.sender;
  const fileId = req.params.fileId;

  try {
    // Use your function to download the file from S3
    const fileContent = await filemanager.downloadFileFromS3(projectId,sender ,fileId);

    // Set headers and send the file content
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileContent.name}"`);
    res.send(fileContent.content);
  } catch (error) {
    console.error('Error fetching file data:', error.message);
    res.status(500).send('Error fetching file data');
  }
});


router.post('/projects/:projectId/:userid/files/share', upload.single('file'), async (req, res) => {
  const projectId = req.params.projectId;
  const sender = req.params.userid; // Replace with actual sender information
  const file = req.file; // This contains information about the uploaded file

  try {
    // Upload the file to S3
    await filemanager.uploadFileToS3(projectId, sender, file);

    // Save file information (e.g., file.name, etc.) to a database

    res.status(200).send('File shared successfully');
  } catch (error) {
    console.error('Error sharing file:', error.message);
    res.status(500).send('Error sharing file');
  }
});






// Get all projects
router.get('/projects/:userid', async (req, res) => {
  
  const {userid}=req.params;
 
  try {
    // const currentUserOwnerId = req.session.user.id; // Get the user ID from the session
    const projects = await Project.getAll(userid);
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching projects');
  }
});



// Get current user's projects
router.get('/myprojects/:userid', async (req, res) => {
  // const name = req.session.user.name;
  // console.log(name);
 const client_id=req.params.userid;
  try {
    // const currentUserOwnerId = req.session.user.id; // Get the user ID from the session
    const projects = await Project.getmy(client_id);
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching projects');
  }
});
// Route to delete a project and related requests and members
router.delete('/projects/:projectId', async (req, res) => {
  const projectId = req.params.projectId;

  try {
    // Delete the project
    const deleteProjectQuery = 'DELETE FROM projects WHERE id = ?';
    await connection.query(deleteProjectQuery, [projectId]);

    // Delete related join requests
    const deleteRequestsQuery = 'DELETE FROM project_join_requests WHERE project_id = ?';
    await connection.query(deleteRequestsQuery, [projectId]);

    // Delete related project members
    const deleteMembersQuery = 'DELETE FROM project_members WHERE project_id = ?';
    await connection.query(deleteMembersQuery, [projectId]);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
});


router.post('/projects/:projectId/join', async (req, res) => {
  const { freelancerId } = req.body;
  const { projectId } = req.params;

  try {
    // Check if the project exists
    const projectExistsQuery = 'SELECT * FROM projects WHERE id = ?';
    const [project] = await connection.query(projectExistsQuery, [projectId]);

    if (!project.length) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if the join request already exists
    const existingRequestQuery = 'SELECT * FROM project_join_requests WHERE project_id = ? AND freelancer_id = ?';
    const [existingRequest] = await connection.query(existingRequestQuery, [projectId, freelancerId]);

    if (existingRequest.length) {
      return res.status(400).json({ message: 'Join request already exists' });
    }

    // Create a new join request
    const createRequestQuery = 'INSERT INTO project_join_requests (project_id, freelancer_id, status) VALUES (?, ?, ?)';
    await connection.query(createRequestQuery, [projectId, freelancerId, 'pending']);

    res.status(201).json({ message: 'Join request sent successfully' });
  } catch (error) {
    console.error('Error creating join request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



router.get('/requestedprojects/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Fetch all projects for the user from the database along with join request status
    const query = `
    SELECT projects.id, projects.name, projects.description, projects.status, project_join_requests.status AS join_status
    FROM projects
    LEFT JOIN project_join_requests ON projects.id = project_join_requests.project_id
                                       AND project_join_requests.freelancer_id = ?
    WHERE project_join_requests.status IS NOT NULL;
    `;

    const [projects, _] = await connection.query(query, [userId]);

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects with join status:', error);
    res.status(500).json({ message: 'Error fetching projects with join status' });
  }
});




// Route to get project requests of other users for the projects created by the current logged in user
router.get('/projectrequests/:userid', async (req, res) => {
  const userId = req.params.userid;

  try {
    // Fetch project requests for the user from the database
    const query = `
    SELECT project_join_requests.id, projects.name AS project_name, project_join_requests.status AS join_status, users.id AS freelancer_id, users.name AS freelancer_name
    FROM projects
    LEFT JOIN project_join_requests ON projects.id = project_join_requests.project_id AND projects.client_id = ?
    LEFT JOIN users ON project_join_requests.freelancer_id = users.id
    WHERE project_join_requests.status IN ('pending')
    `;

    const [requests, _] = await connection.query(query, [userId]);

    res.json(requests);
  } catch (error) {
    console.error('Error fetching project requests:', error);
    res.status(500).json({ message: 'Error fetching project requests' });
  }
});



// Route to accept a project request
router.post('/projectrequests/:requestId/accept', async (req, res) => {
  const requestId = req.params.requestId;

  try {
    // Update the project request status in the database to 'accepted'
    const updateRequestQuery = 'UPDATE project_join_requests SET status = "accepted" WHERE id = ?';
    await connection.query(updateRequestQuery, [requestId]);

    // Get the project_id and freelancer_id from the project_join_requests table
    const getRequestQuery = 'SELECT project_id, freelancer_id FROM project_join_requests WHERE id = ?';
    const [requestResult] = await connection.query(getRequestQuery, [requestId]);

    if (requestResult.length === 0) {
      return res.status(404).json({ message: 'Project request not found' });
    }

    const { project_id, freelancer_id } = requestResult[0];

    // Insert a record into the project_members table
    const insertMemberQuery = 'INSERT INTO project_members (project_id, user_id) VALUES (?, ?)';
    await connection.query(insertMemberQuery, [project_id, freelancer_id]);

    res.json({ message: 'Project request accepted successfully' });
  } catch (error) {
    console.error('Error accepting project request:', error);
    res.status(500).json({ message: 'Error accepting project request' });
  }
});


// Route to reject a project request
router.post('/projectrequests/:requestId/reject', async (req, res) => {
  const requestId = req.params.requestId;

  try {
    // Update the project request status in the database to 'rejected'
    const updateQuery = 'UPDATE project_join_requests SET status = "rejected" WHERE id = ?';
    await connection.query(updateQuery, [requestId]);

    res.json({ message: 'Project request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting project request:', error);
    res.status(500).json({ message: 'Error rejecting project request' });
  }
});

module.exports = router;
