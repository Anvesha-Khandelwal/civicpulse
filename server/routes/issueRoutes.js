const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { protect } = require('../midddlewares/auth');
const {
  getIssues, getIssueById, createIssue, voteIssue, getMyIssues,
} = require('../controllers/issueController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/',        getIssues);
router.get('/my',      protect, getMyIssues);
router.get('/:id',     getIssueById);
router.post('/',       protect, upload.array('media', 5), createIssue);
router.post('/:id/vote', protect, voteIssue);

module.exports = router;