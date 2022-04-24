const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateReview } = require('../middleware.js');
const review = require('../controllers/review.js')


router.post('/', isLoggedIn, validateReview, catchAsync(review.createReview));

router.delete('/:reviewId', isLoggedIn, catchAsync(review.deleteReview));

module.exports = router;