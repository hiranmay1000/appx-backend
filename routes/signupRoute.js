const express = require('express');
const router = express.Router();
const connectToDatabase = require('../config/db');
const upload = require('../config/multer');

// SIGNUP
router.post('/signup', upload.single('image'), async (req, res) => {
  const { username, email, password } = req.body;
  const file = req.file;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('user-credentials');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    let imageUrl = null;
    if (file) {
      imageUrl = `/uploads/images/${file.filename}`;
    }

    const newUser = { username, email, password, image: imageUrl };
    const result = await usersCollection.insertOne(newUser); 

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: result.insertedId,
        username: newUser.username,
        email: newUser.email,
        image: newUser.image
      }
    });
  } catch (error) {
    console.error('Error adding user:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
