const mongoose = require('mongoose');

const HomeSchema = new mongoose.Schema({
  // STATIC fields - optional since you're keeping them static
  bannerHeading: { type: String, default: 'Welcome to' },
  bannerSubHeading: { type: String, default: 'Fancy Perfume' },
  tagline: { type: String, default: 'The Royalty of fragrance' },
  bottomDescription: { type: String, default: 'Welcome to our exclusive collection...' },
  
  // DYNAMIC fields - name required, image optional
  latestProducts: [{
    name: { type: String, required: true },    // Name ALWAYS required
    image: { type: String, default: '' }       // Image optional
  }],
  
  occasions: [{
    name: { type: String, required: true },    // Name ALWAYS required  
    image: { type: String, default: '' }       // Image optional
  }],
}, {
  timestamps: true
});

module.exports = mongoose.model('Home', HomeSchema);
