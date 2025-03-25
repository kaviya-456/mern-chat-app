const express = require("express");
const axios = require("axios");
const router = express.Router();
require('dotenv').config();


// Hugging Face API Configuration
const HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1";
const HF_API_KEY = process.env.HF_API_KEY; // Replace with your actual API key

console.log("HF_API_KEY:", HF_API_KEY ? "Loaded ✅" : "Not Loaded ❌");

// Function to Get AI Response
async function getAIResponse(prompt, detailed = false) {
  try {
    const response = await axios.post(
      HF_API_URL,
      { inputs: prompt },
      { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
    );

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      let reply = response.data[0].generated_text.trim();

      // Check if the response contains code-like patterns or other non-relevant text
      const codeRegex = /`.*`/g; // Matches code blocks
      const emailRegex = /Dear [A-Za-z]+/; // Matches email-like content

      if (codeRegex.test(reply) || emailRegex.test(reply)) {
        reply = "I’m sorry, I didn’t understand that. Could you clarify your question?";
      }

      // Clean up unwanted content
      reply = reply.replace(/## Answer.*$/, "").trim(); // Remove "## Answer"
      reply = reply.replace(/\n+/g, " ").trim(); // Remove multiple newlines

      // Remove question repetition (if it exists at the beginning of the response)
      reply = reply.replace(/^.*?\?+\s*/i, "").trim(); // Remove the question part if it's at the start

      // If the answer is still unclear or too short, return a default response
      if (!reply || reply.length < 10) {
        reply = "Can you please rephrase your question? I'm having trouble understanding it.";
      }

      return reply;
    } else {
      return "I'm not sure. Can you ask another question?";
    }
  } catch (error) {
    console.error("Hugging Face API Error:", error.response?.data || error.message);
    return "Sorry, I couldn't process your request.";
  }
}

// Chat Route
router.post("/chat", async (req, res) => {
  const { message, detailed } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const reply = await getAIResponse(message, detailed);
  res.json({ reply });
});

module.exports = router;
