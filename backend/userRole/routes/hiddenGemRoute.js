const express = require('express');
const { createHiddenGem, readAllHiddenGems, readHiddenGemById, downvoteHiddenGem, upvoteHiddenGem } = require('../controllers/hiddenGemController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { createGemSchema } = require('../../validations/hiddenGemValidator');
const router = express.Router();

router.post('/create', authMiddleware, validate(createGemSchema), createHiddenGem);
router.get('/all-gems', authMiddleware, readAllHiddenGems);
router.get('/gem-by-id/:gemId', authMiddleware, readHiddenGemById);
router.post('/upvote/:gemId', authMiddleware, upvoteHiddenGem);
router.post('/downvote/:gemId', authMiddleware, downvoteHiddenGem);

module.exports = router;