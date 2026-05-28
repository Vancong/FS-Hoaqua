const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authUserMiddleware } = require('../middleware/auth.middleware');

router.post('/toggle/:userId', authUserMiddleware, favoriteController.toggleFavorite);
router.get('/getUserFavorite/:userId', authUserMiddleware, favoriteController.getUserFavorite);

module.exports = router;
