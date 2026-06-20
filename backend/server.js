const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'AttendanceRecords';

// Mark attendance
app.post('/api/attendance', async (req, res) => {
  const { employeeName, employeeId, status, organization } = req.body;
  const record = {
    id: uuidv4(),
    employeeName,
    employeeId,
    status,
    organization,
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
  };

  const params = {
    TableName: TABLE_NAME,
    Item: record,
  };

  try {
    await dynamoDB.put(params).promise();
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all attendance records
app.get('/api/attendance', async (req, res) => {
  const params = { TableName: TABLE_NAME };
  try {
    const data = await dynamoDB.scan(params).promise();
    res.json(data.Items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance by date
app.get('/api/attendance/date/:date', async (req, res) => {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: '#d = :date',
    ExpressionAttributeNames: { '#d': 'date' },
    ExpressionAttributeValues: { ':date': req.params.date },
  };
  try {
    const data = await dynamoDB.scan(params).promise();
    res.json(data.Items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));