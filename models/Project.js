const connection = require('../config/database'); // Assuming connection is your MySQL connection object

class Project {
  constructor(name, description, ownerId) {
    this.name = name;
    this.description = description; 
    this.ownerId = ownerId;
    this.status = 'open';
    this.createdAt = new Date();
  }

  static async getAll(userid) {
    const query = `
    SELECT projects.*, users.name AS client_name
    FROM projects
    INNER JOIN users ON projects.client_id = users.id
    WHERE projects.client_id != ?;
    `;
    console.log('Executing query:', query);
  
      try {
        const [projects] = await connection.query(query, [userid]);
        
        if (Array.isArray(projects)) {
          return projects;
        } else {
          console.error('Unexpected data format:', projects);
          // Handle the case where projects is not an array
        }
      } catch (error) {
        console.error('Error executing query:', error.message);
        throw error; // Propagate the error to the caller
      }
    
  }
  
  //specific users's projects
  static async getmy(user_id) {
    const query = 'SELECT * FROM projects WHERE client_id=?;';
      console.log('Executing query:', query);
  
      try {
        const [projects] = await connection.execute(query,[user_id]);
        
        if (Array.isArray(projects)) {
          return projects;
        } else {
          console.error('Unexpected data format:', projects);
          // Handle the case where projects is not an array
        }
      } catch (error) {
        console.error('Error executing query:', error.message);
        throw error; // Propagate the error to the caller
      }
    
  }

  // static async get(id) {
  //   const query = 'SELECT * FROM projects WHERE id = ?';
  //   const [project] = await connection.query(query, [id]);

  //   if (!project[0]) {
  //     return null;
  //   }

  //   return {
  //     id: project[0].id,
  //     name: project[0].name,
  //     description: project[0].description,
  //     ownerId: project[0].owner_id,
  //     status: project[0].status,
  //     createdAt: project[0].created_at,
  //   };
  // }

  

  // async create() {
  //   const query = `INSERT INTO projects (name, description, owner_id, status, created_at)
  //                   VALUES (?, ?, ?, ?, ?)`;
  //   const [result] = await connection.query(query, [this.name, this.description, this.ownerId, this.status, this.createdAt]);

  //   this.id = result.insertId;
  // }

  // async update(newValues) {
  //   const query = `UPDATE projects SET name = ?, description = ?, status = ?
  //                   WHERE id = ?`;
  //   await connection.query(query, [newValues.name, newValues.description, newValues.status, this.id]);
  // }

  // async delete() {
  //   const query = 'DELETE FROM projects WHERE id = ?';
  //   await connection.query(query, [this.id]);
  // }
}

module.exports = Project;
