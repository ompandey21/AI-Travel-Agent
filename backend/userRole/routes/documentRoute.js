const express = require("express");
const { createDoc, getAllDocs, getDocById, updateDoc, deleteDoc } = require("../controllers/documentController");
const auth = require("../middlewares/authMiddleware");
const upload = require("../../config/multer");
const router = express.Router();

router.post('/trips/:tripId', auth, upload.single('file'), createDoc);
router.get('/trips/:tripId', auth, getAllDocs);
router.get('/:docId', auth, getDocById);
router.patch('/:docId', auth, updateDoc);
router.delete('/:docId', auth, deleteDoc);

module.exports = router;