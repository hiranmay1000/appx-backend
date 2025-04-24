const express = require('express');
const router = express.Router();
const connectToDatabase = require('../config/db');


// CHANGE PASSWORD
router.post('/change-password', async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
  
    try {
      const db = await connectToDatabase();
      const collection = db.collection('user-credentials');
      const user = await collection.findOne({ email });
  
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (user.password !== oldPassword) return res.status(401).json({ message: 'Incorrect old password' });
  
      await collection.updateOne({ email }, { $set: { password: newPassword } });
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error', err });
    }
  });

  module.exports = router;
  