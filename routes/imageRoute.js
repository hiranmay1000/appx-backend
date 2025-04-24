const express = require('express');
const upload = require('../config/multer');
const imageRoute = express.Router();
const path = require('path');
const fs = require('fs');
const connectToDatabase = require('../config/db')
const { ObjectId } = require("mongodb");

// GET IMAGE BY FILENAME
imageRoute.get('/uploads/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads/images', filename);
  const defaultImagePath = path.join(__dirname, '../uploads/images/default-profile-img.png');

  // Check if the image exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.sendFile(defaultImagePath);
    } else {
      res.sendFile(filePath);
    }
  });
});



// UPDATE PROFILE PICTURE
imageRoute.put('/profile/edit-image', upload.single('image'), async (req, res) => {
  const file = req.file;
  const { userId, oldImagePath } = req.body;

  if (!file || !userId) {
    return res.status(400).json({ message: 'No image uploaded or user ID missing' });
  }

  const db = await connectToDatabase();
  const collection = db.collection('user-credentials');
  const user = await collection.findOne({ _id: new ObjectId(userId) });

  if (!user) return res.status(404).json({ message: 'User not found' });

  if (oldImagePath && !oldImagePath.includes('default-profile-img.png')) {
    const fullPath = path.join(__dirname, '../uploads/images', path.basename(oldImagePath));
    fs.unlink(fullPath, (err) => {
      if (err) console.warn('Old image not found or already deleted:', err.message);
    });
  }

  const newImagePath = `/uploads/images/${file.filename}`;

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: { image: newImagePath } },
    { returnDocument: 'after' }
  );

  
  const newUser = {
    _id: result._id,
    username: result.username,
    email: result.email,
    image: result.image
  }
  
  return res.status(200).json({
    message: 'Image updated successfully',
    user: newUser,
  });
});



module.exports = imageRoute;