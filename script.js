const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/test', async (req, res) => {
  const { url, requests = 50 } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  let successCount = 0;
  let failureCount = 0;
  let responseTimes = [];

  const makeRequest = async () => {
    const start = Date.now();
    try {
      await axios.get(url);
      const duration = Date.now() - start;
      responseTimes.push(duration);
      successCount++;
    } catch (err) {
      failureCount++;
    }
  };

  const requestPromises = [];
  for (let i = 0; i < requests; i++) {
    requestPromises.push(makeRequest());
  }

  await Promise.all(requestPromises);

  const avgResponse =
    responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0;

  res.json({
    totalRequests: requests,
    successful: successCount,
    failed: failureCount,
    avgResponse: Math.round(avgResponse),
    responseTimes,
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});