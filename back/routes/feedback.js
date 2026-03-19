// routes/feedback.js
const express = require("express");
const Feedback = require("../models/Feedback");
const router = express.Router();

// Route to save feedback
router.post("/add", async (req, res) => {
  const { name, emailOrPhone, city, message, rating } = req.body;

  if (!name || !emailOrPhone || !city || !message || !rating) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const feedback = new Feedback({ name, emailOrPhone, city, message, rating });
    await feedback.save();
    res.json({ message: "Feedback saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving feedback");
  }

});




// Add this below your POST route
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching feedbacks");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting feedback");
  }
});


module.exports = router;
