const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
 name: {
  type: String,
  required: true,
 },
category: {
  type: [String],
  required: true,
},

 price: {
  type: Number,
  required: true,
 },
 description: {
  type: String,
  required: true,
 },
 imageUrl: {
  type: String,
 required: true,
 },


 notes: {
 top: [{name: String, imageUrl: String}], 
 middle: [{name: String, imageUrl: String}], 
 base: [{name: String, imageUrl: String}], 
}


});


module.exports = mongoose.model('Product', ProductSchema); 