const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('CrimeGPT Backend API');
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
