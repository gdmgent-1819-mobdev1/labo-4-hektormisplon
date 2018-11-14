//  Init Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiaGVrdHIiLCJhIjoiY2pvM2NqYXU2MHQ3bjNwbnNuZGxwdmU1NiJ9.NPQJL5jUnYbId3pn5OqKdg';

function getClientLocation(){
    if("geolocation" in navigator){
        navigator.geolocation.getCurrentPosition(function(position) {
            myLat = position.coords.latitude;
            myLon = position.coords.longitude;
            console.log('My Location: ' ,{myLat, myLon});
        });
    }
    else{
        console.log('No geolocation available');
    }
}

let map = new mapboxgl.Map({
    container: 'map__user-map',
    center: [-122.420679, 37.772537], //    pass in current user's coords
    zoom: 13,
    style: 'mapbox://styles/mapbox/basic-v8',
    hash: true,
    transformRequest: (url, resourceType)=> {
        if(resourceType === 'Source' && url.startsWith('http://myHost')) {
            return {
                url: url.replace('http', 'https'),
                headers: { 'my-custom-header': true},
                credentials: 'include'  // Include cookies for cross-origin requests
            };
        } 
    }
});

//  add button to display/hide map instead of user image
const displayUserMapBtn = document.querySelector('.display__user-map');
displayUserMapBtn.addEventListener('click', () => {
    const userImageEl = document.querySelector('.user__image');
    const userMapEl = document.querySelector('.map__user-map');


    if(userImageEl.style.display !== 'none') {
        userImageEl.style.display = 'none';
        userMapEl.style.display = 'block';
    } else if(userImageEl.style.display === 'none') {
        userImageEl.style.display = 'block';
        userMapEl.style.display = 'none';
    }
})

function displayUserLocation(user) {
    map.flyTo({
        center: [user.coords.longitude, user.coords.latitude],
        zoom: 9
    });
}