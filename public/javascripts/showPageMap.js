mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom

});

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .addTo(map);

const popup = new mapboxgl.Popup({ offset: 25 })
    .setLngLat(campground.geometry.coordinates)
    .setHTML(`<h5>${campground.title}</h5><p>${campground.location}</p>`)
    .addTo(map);
map.addControl(new mapboxgl.NavigationControl());