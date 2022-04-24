const express = require('express');
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const db = mongoose.connection;
db.on('error', () => { console.log("Connection Error!") }
);
db.once('open', () => {
    console.log("Database Connected!")
});

// const sampler = (array) => array[Math.floor(Math.random() * 10)];
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const ran_number = Math.floor(Math.random() * 300 + 100);
        const camp = new Campground({
            author: "6261249eb7b452501cce6a8a",
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            description: "sdahfouewhfoandanf adfnqipewnfa sfwandfenrgrwf ger gerwgerg qw efwqe fwegwqeg",
            price: ran_number,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/ziting95/image/upload/v1650669233/YelpCamp/kjs77u2liwkehgavcpdx.jpg',
                    filename: 'YelpCamp/kjs77u2liwkehgavcpdx'
                },
                {
                    url: 'https://res.cloudinary.com/ziting95/image/upload/v1650669233/YelpCamp/mmxioevzdkt4xwrqyuw4.jpg',
                    filename: 'YelpCamp/mmxioevzdkt4xwrqyuw4'
                },
                {
                    url: 'https://res.cloudinary.com/ziting95/image/upload/v1650669233/YelpCamp/lu5b5iwiknxx7hr56gef.jpg',
                    filename: 'YelpCamp/lu5b5iwiknxx7hr56gef'
                }
            ]
        });

        await camp.save();
    }

}

seedDB();