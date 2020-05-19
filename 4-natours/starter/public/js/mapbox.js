
export const displayMap = function (locations) {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZXpyYWVsIiwiYSI6ImNrYWNnNHZ1ODA1djgyeHA0YnJ6b2Y0MWIifQ.KV0JrUE_qmIrsogxdX_JUQ';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/ezrael/ckacgot9m5smp1iqkeovbmg0v',
        scrollZoom: false
        // center: [-118.113491, 34.111745],
        // zoom: 10,
        // interactive: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {

        // Create Marker
        const el = document.createElement('div');
        el.className = 'marker'

        // Add Marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);

        //Add popup

        new mapboxgl.Popup({
            offset: 40
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        // Extend map bounds to include current location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}