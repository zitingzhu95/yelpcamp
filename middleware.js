const Campgrounds = require('./models/campground.js');
const ExpressError = require('./utils/ExpressError.js');
const { campgroundSchema, reviewSchema } = require('./schemas.js');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'you must be signed in');
        return res.redirect('/login');
    }
    next();

}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campgrounds.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have the permission');
        return res.redirect(`/campground/${id}`);
    }
    next();
};

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }

}

module.exports.validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body.reviews);
    if (error) {

        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }

}
