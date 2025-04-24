const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const upload = require('../config/multer');
const connectToDatabase = require('../config/db');
const { ObjectId } = require("mongodb");

// CREATE NEW FOLDER
router.post('/vault/folder', async (req, res) => {
  const { name, parentId, userId } = req.body;
  const folder = {
    name,
    type: 'folder',
    userId,
    parentId: parentId || null,
    createdAt: new Date()
  };

  try {
    const db = await connectToDatabase();
    const result = await db.collection('vault-items').insertOne(folder);

    const insertedFolder = await db.collection('vault-items').findOne({ _id: result.insertedId });

    res.status(201).json(insertedFolder);
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ message: "Server error creating folder" });
  }
});


// UPLOAD FILES TO A FOLDER
router.post("/vault/upload", upload.array("files"), async (req, res) => {
  try {
    const { parentId, userId } = req.body;
    const files = req.files;

    if (!userId || !files || files.length === 0) {
      return res.status(400).json({ message: "Missing required data." });
    }

    const fileEntries = files.map((file) => ({
      _id: uuidv4(),
      name: file.originalname,
      type: "file",
      filePath: `/uploads/images/${file.filename}`,
      userId,
      parentId: parentId || null,
      createdAt: new Date(),
    }));

    const db = await connectToDatabase();
    await db.collection("vault-items").insertMany(fileEntries);

    return res.status(201).json({
      message: "Files uploaded successfully.",
      files: fileEntries,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return res.status(500).json({ message: "Server error during upload." });
  }
});



// List folder contents
router.get('/vault/:userId', async (req, res) => {
  const { userId } = req.params;
  const { parentId } = req.query;

  try {
    const db = await connectToDatabase();
    const items = await db.collection('vault-items')
      .find({
        userId,
        parentId: parentId === 'null' ? null : parentId
      })
      .toArray();

    res.status(200).json(items);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});




const toObjectId = (id) => {
  return ObjectId.isValid(id) && typeof id === 'string' ? new ObjectId(id) : id;
};

router.delete('/vault/delete', async (req, res) => {
  const { itemId, type } = req.body;
  try {
    const db = await connectToDatabase();

    if (type === 'folder') {
      await deleteFolderAndContents(db, itemId);
    } else if (type === 'file') {
      await db.collection('vault-items').deleteOne({ _id: toObjectId(itemId) });
    }

    return res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error("Error during deletion:", error);
    return res.status(500).json({ message: 'Failed to delete the item' });
  }
});

async function deleteFolderAndContents(db, folderId) {
  const itemsInFolder = await db.collection('vault-items').find({ parentId: folderId }).toArray();

  for (let item of itemsInFolder) {
    if (item.type === 'folder') {
      await deleteFolderAndContents(db, item._id);
    } else if (item.type === 'file') {
      await db.collection('vault-items').deleteOne({ _id: toObjectId(item._id) });
    }
  }

  await db.collection('vault-items').deleteOne({ _id: toObjectId(folderId) });
}




module.exports = router