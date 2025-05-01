require('dotenv').config()

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DATABASE_PASSWORD,
  database: 'webhook',
  port:'3307',
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected');
});

// GitHub webhook endpoint
app.post('/webhook', (req, res) => {
  const body = req.body;

  console.log(body);
  const pusher = body.pusher?.name || '';
  const repo = body.repository?.name || '';
  const branch = body.ref?.split('/').pop() || '';
  const commit = body.head_commit || {};

  const commit_msg = commit.message || '';
  const commit_id = commit.id || '';

  const sql = `INSERT INTO github_pushes 
    (pusher_name, repo_name, branch, commit_msg, commit_id)
    VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [pusher, repo, branch, commit_msg, commit_id], (err) => {
    if (err) {
      console.error('DB Error:', err);
      return res.sendStatus(500);
    }
    console.log('Push data saved to DB');
    res.sendStatus(200);
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
