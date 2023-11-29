const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const connection = require('../config/database');
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

module.exports = router;

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

// // Get a specific project
// router.get('/:id', async (req, res) => {
//   try {
//     const project = await Project.get(req.params.id);
//     if (!project) {
//       res.status(404).send('Project not found');
//       return;
//     }
//     res.json(project);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Error fetching project');
//   }
// });

// Create a new project
router.post('/createproject', async (req, res) => {
  const { name, description, status} = req.body;
  const client_id  = 1; // Assuming client_id is available in req.user after authentication

  // Insert the project data into the database
  const query = 'INSERT INTO projects (name, description, status, client_id) VALUES (?, ?, ?, ?)';

  connection.query(query, [name, description, status, client_id], (err, result) => {
    if (err) {
      console.error('Error creating project:', err);
      res.status(500).json({ message: 'Project creation failed' });
    } else {
      res.status(201).json({ message: 'Project created successfully', projectId: result.insertId });
    }
  });
});



// // Update a project
// router.put('/:id', async (req, res) => {
//   const { name, description, status } = req.body;

//   if (!name || !description || !status) {
//     res.status(400).send('Missing required fields');
//     return;
//   }

//   try {
//     const project = await Project.get(req.params.id);
//     if (!project) {
//       res.status(404).send('Project not found');
//       return;
//     }

//     project.name = name;
//     project.description = description;
//     project.status = status;
//     await project.update();
//     res.json(project);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Error updating project');
//   }
// });

// // Delete a project
// router.delete('/:id', async (req, res) => {
//   try {
//     const project = await Project.get(req.params.id);
//     if (!project) {
//       res.status(404).send('Project not found');
//       return;
//     }

//     await project.delete();
//     res.json({ message: 'Project deleted successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Error deleting project');
//   }
// });

module.exports = router;
