const Reviews = require('../models/review');
const Campgrounds = require('../models/campground');


module.exports.createReview = async (req, res, next) => {
    const campground = await Campgrounds.findById(req.params.id).populate('reviews');
    const review = new Reviews(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully made a new review');
    res.redirect(`/campground/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campgrounds.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Reviews.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted a review');
    res.redirect(`/campground/${id}`);
};
