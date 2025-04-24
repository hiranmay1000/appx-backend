const connectToDatabase = require('../config/db');
const router = require('express').Router();
const { ObjectId } = require('mongodb');
const fs = require('fs');


router.delete('delete-profile', async (req, res) => {
    const { userId } = req.body;

    if(!userId) {
        return res.status(400).json({message: "User ID is required"});
    }

    const db = await connectToDatabase();
    const collection = db.collection('user-credentials');

    const result = await collection.deleteOne({_id : new ObjectId(userId)});

    if(result.deletedCount === 0) {
        return res.status(404).json({message: "User not found"});
    }

    res.status(200).json({message: "User deleted successfully"});

    // delete the files and folders associated with the userId

})


module.exports = router;