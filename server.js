const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI); 

const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error(err));

 // console.log('Loaded OpenAI API Key:', process.env.OPENAI_API_KEY);


const chatRoute = require('./routes/chat');
console.log('Chat route loaded');
app.use('/api', chatRoute);

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));