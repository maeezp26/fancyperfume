const mongoose = require("mongoose");

const aboutSectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String }, // Store path for uploaded images
});

const aboutSchema = new mongoose.Schema({
  sections: [aboutSectionSchema],
});

module.exports = mongoose.model("About", aboutSchema);
