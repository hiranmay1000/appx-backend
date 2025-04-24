const connectToDatabase = require('../config/db');

module.exports = async (req, res, next) => {
    try{
        req.db = await connectToDatabase();
        next();
    }catch(err){
        console.error("Database connection error:", err);
        res.status(500).json({ message: "Database connection error", error: err });
    }
};