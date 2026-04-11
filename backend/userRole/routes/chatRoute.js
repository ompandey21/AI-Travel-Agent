const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { getChatHistory } = require('../controllers/chatController');

router.get('/:tripId/history', auth, getChatHistory);

module.exports = router;
