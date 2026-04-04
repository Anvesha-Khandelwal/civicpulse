const express = require('express');
const router  = express.Router();
const { protect, authorityOnly } = require('../middlewares/auth');
const { getDepartmentIssues, updateIssue, removeIssue } = require('../controllers/adminController');

router.use(protect, authorityOnly);

router.get('/issues',        getDepartmentIssues);
router.patch('/issues/:id',  updateIssue);
router.delete('/issues/:id', removeIssue);

module.exports = router;