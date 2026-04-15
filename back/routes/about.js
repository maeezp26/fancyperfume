// back/routes/about.js
// Images stored on Cloudinary — permanent CDN URLs

const express = require('express');
const About   = require('../models/About');
const { createUploader, deleteByUrl, formatUploadError } = require('../utils/cloudinary');

const router   = express.Router();
const uploader = createUploader('about');

// About has a variable number of sections (up to ~10), each with one optional image
const rawUpload = uploader.array('images', 10);

const upload = (req, res, next) => {
  rawUpload(req, res, (err) => {
    if (err) {
      const message = formatUploadError(err);
      console.error('About upload error:', message);
      return res.status(400).json({ success: false, error: `Image upload failed: ${message}` });
    }

    next();
  });
};

// ── GET /api/about ────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const about = await About.findOne().lean();
    if (!about) {
      // Seed with defaults on first access
      const newAbout = new About({ sections: [] });
      await newAbout.save();
      return res.json(newAbout);
    }
    res.json(about);
  } catch (error) {
    console.error('GET /about error:', error);
    res.status(500).json({ error: 'Error fetching about page data' });
  }
});

// ── PUT /api/about ────────────────────────────────────────────────────────────
router.put('/', upload, async (req, res) => {
  try {
    const { sections } = JSON.parse(req.body.data || '{"sections":[]}');
    const files = req.files || [];

    // Track which section index maps to which uploaded file
    // files[] only contains entries for sections that actually had a file selected,
    // so we use a running counter
    let fileIdx = 0;

    const updatedSections = sections.map((section, index) => {
      const hasFile = files[fileIdx] && parseInt(files[fileIdx].fieldname?.replace(/\D/g, '')) === index;
      // fallback: just consume next file for any section that doesn't already have an imageUrl
      // Actually multer.array doesn't give us per-index info, so we check the original
      // section data to determine whether to update the image
      return section;
    });

    // Better approach: iterate files array and match to sections by order
    // We can't know which section each file belongs to without per-field names.
    // The frontend sends files in section order, skipping sections with no new file.
    // We use a flag in section data: if section.newImage === true, consume next file.
    let fi = 0;
    const finalSections = sections.map((section) => {
      if (section._replaceImage && files[fi]) {
        const url = files[fi].path; // Cloudinary URL
        fi++;
        return { title: section.title, content: section.content, imageUrl: url };
      }
      // Keep existing imageUrl (could be Cloudinary URL from before)
      return { title: section.title, content: section.content, imageUrl: section.imageUrl || '' };
    });

    let about = await About.findOne();
    if (!about) {
      about = new About({ sections: finalSections });
    } else {
      about.sections = finalSections;
    }
    await about.save();

    res.json({ message: 'About page updated successfully!', about });
  } catch (error) {
    console.error('PUT /about error:', error);
    res.status(500).json({ error: 'Error updating about page: ' + error.message });
  }
});

module.exports = router;
