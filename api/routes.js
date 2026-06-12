const express = require('express');
const router = express.Router();
const pixivController = require('../controllers/pixivController');

router.get('/', pixivController.renderHome);
router.get('/search', pixivController.handleSearch);
router.get('/artwork/:id', pixivController.handleViewArtwork);
router.get('/user/:id', pixivController.handleUserProfile);
router.get('/proxy', pixivController.proxyImage);

module.exports = router;