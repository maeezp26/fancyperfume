const express = require("express");
const multer = require("multer");
const path = require("path");
const About = require("../models/About");

const router = express.Router();

// Setup multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/about");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Get about page
router.get("/", async (req, res) => {
  try {
    const about = await About.findOne();
    if (!about) {
      // If no data, initialize a new one
      const newAbout = new About({ sections: [] });
      await newAbout.save();
      return res.json(newAbout);
    }
    res.json(about);
  } catch (error) {
    res.status(500).json({ error: "Error fetching about page data" });
  }
});

// Update about page
// Expecting sections[] with title, content, and optionally files for images
router.put("/", upload.array("images"), async (req, res) => {
  try {
    const { sections } = JSON.parse(req.body.data);
    const files = req.files;

    // Map files to sections
    const updatedSections = sections.map((section, index) => {
      if (files[index]) {
        section.imageUrl = `/uploads/about/${files[index].filename}`;
      }
      return section;
    });

    let about = await About.findOne();
    if (!about) {
      about = new About({ sections: updatedSections });
    } else {
      about.sections = updatedSections;
    }

    await about.save();
    res.json({ message: "About page updated successfully!", about });
  } catch (error) {
    res.status(500).json({ error: "Error updating about page" });
  }
});

module.exports = router;
