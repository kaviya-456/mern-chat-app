const express = require("express");
const axios = require("axios");
const router = express.Router();
require('dotenv').config();

// Hugging Face API Configuration
const HF_API_URL = "https://api-inference.huggingface.co/models/DeepSeek-V3-0324";


const HF_API_KEY = process.env.HF_API_KEY; // Your Hugging Face API Key from .env

// Check if API key is loaded successfully
console.log("HF_API_KEY:", HF_API_KEY ? "Loaded ✅" : "Not Loaded ❌");
console.log("API URL:", HF_API_URL);

async function getAIResponse(prompt) {
  try {
    const response = await axios.post(
      HF_API_URL,
      { inputs: prompt },
      { headers: { Authorization: `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" } }
    );

    console.log("Hugging Face Response:", response.data);
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      let reply = response.data[0].generated_text.trim();
      reply = reply.replace(/\n+/g, " ").trim();
      return reply.length > 10 ? reply : "Can you rephrase that?";
    } else {
      return "I’m not sure. Can you ask another question?";
    }
  } catch (error) {
    console.error("Hugging Face API Error:", error.response?.data || error.message);
    return "Sorry, I couldn't process your request.";
  }
}



// Chat Route - Handles POST requests to '/chat'
router.post("/chat", async (req, res) => {
  const { message } = req.body; // Extract message from request body
  if (!message) return res.status(400).json({ error: "Message is required" }); // If message is missing, return error

  // Get AI reply from Hugging Face API
  const reply = await getAIResponse(message);

  // Send back the reply as JSON
  res.json({ reply });
});

module.exports = router;
