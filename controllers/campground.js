const Campgrounds = require('../models/campground.js');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campgrounds.find({});
    res.render('campground/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campground/new');
};

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    console.log(req.files);
    const campground = new Campgrounds(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filemname }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground)
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campground/${campground._id}`);

}

module.exports.showCampground = async (req, res) => {
    const campground = await (await Campgrounds.findById(req.params.id)
        .populate({ path: 'reviews', populate: { path: 'author' } }))
        .populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campground');
    }
    res.render('campground/show', { campground });
};

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campgrounds.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campground');
    }

    res.render('campground/edit', { campground });

};

module.exports.updateCampground = async (req, res) => {
    const updatedCampground = await Campgrounds.findByIdAndUpdate(req.params.id, { ...req.body.campground }, { runValidators: true, new: true });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    updatedCampground.images.push(...imgs);
    await updatedCampground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            console.log(filename);
            await cloudinary.uploader.destroy(filename);
        }
        await updatedCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    console.log(updatedCampground);
    req.flash('success', 'Successfully changed a new campground');
    res.redirect(`/campground/${updatedCampground._id}`)
};

module.exports.deleteCampground = async (req, res) => {

    await Campgrounds.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted a campground');
    res.redirect(`/campground`)
};

