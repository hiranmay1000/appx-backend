const express = require('express');
const router = express.Router();
const connectToDatabase = require('../config/db');

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('user-credentials');

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    return res.status(200).json({ message: 'Login successful', user: { _id: user._id, username: user.username, email: user.email, image: user.image } });

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
