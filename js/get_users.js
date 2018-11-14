console.log('%c Tinder', 'background: #559; color: #fff');

window.onload = () => {
    getClientLocation();
    displayEvaluation();
    fetchUsers(10)
        .then(fetchedUsers => {
            createUserStore(fetchedUsers);
        })
}

//  fetch and filter data for 10 users from API, return an array of objects
function fetchUsers(numOfUsers) {
    return fetch(`https://randomuser.me/api/?results=${numOfUsers}`)
    .then(response => response.json())
    .then((data) => {
        let fetchedUsers = [];
        let users = data.results;
        users = users.map(user => {
            user = {
                uuid:       user.login.uuid,
                name:       user.name.first,
                age:        user.dob.age,
                gender:     user.gender,
                location:   user.location.city,
                coords:     user.location.coordinates,
                img:        user.picture.large,
                liked:      null
            };
            fetchedUsers.push(user);
        })
        return fetchedUsers;
    })
    .catch(error => console.error(`Could not fetch data | ${error}.`));
}

function createUserStore(users) {
    const userDbRequest = window.indexedDB.open('tinderUser', 1);
    userDbRequest.onerror = ((e) => {
        const error = e.target.error;
        console.error(`IndexedDB: error loading database | ${error}`);
    });
    userDbRequest.onsuccess = ((e) => {
        db = userDbRequest.result;
        displayUser(1);
    });
    userDbRequest.onupgradeneeded = ((e) => {
        let db = userDbRequest.result;

        db.onerror = ((e) => {
            console.log('IndexedDB: upgrade db');
        });

        let store = db.createObjectStore('user', {autoIncrement: true});
        users.forEach(user => {
            store.add(
                user
            );
        });
    });
};

function displayUser(index) {
    let tx = db.transaction('user', 'readwrite');
    let store = tx.objectStore('user');

    requestStoreLength = store.count();
    requestStoreLength.onsuccess =  (e) => {
        let indexLength = e.target.result;
        if(index >= indexLength + 1) {
            console.log('Fetching some new users...');
            fetchUsers(10)
            .then(fetchedUsers => {
                addUsers(fetchedUsers);
            })
        }
    };
    //let range = IDBKeyRange.bound(1,3);
    let request = store.get(index);
    request.onsuccess = (e) => {
        let user = e.target.result;
        displayUserLocation(user);
        document.querySelector('.user__image').setAttribute('src', user.img);
        document.querySelector('.user__name').textContent = user.name;
        document.querySelector('.user__age').textContent = user.age;
        document.querySelector('.user__gender').textContent = user.gender;
        document.querySelector('.user__location').textContent = user.location;
        document.querySelector('.evaluation__button--like').onclick = (e) => {
            setLiked(index, true);
        }
        document.querySelector('.evaluation__button--dislike').onclick = (e) => {
            setLiked(index, false);
        }
        document.querySelector('.evaluation__button__return').onclick = (e) => {
            displayUser(index -1);
        }
    }
}

function addUsers(users) {
    let tx = db.transaction('user', 'readwrite');
    let store = tx.objectStore('user');
    users.forEach(user => {
        store.add(
            user
        );
    });
}

function setLiked(index, liked) {

    let store = db.transaction(['user'], 'readwrite').objectStore('user');
    const likedRequest = store.get(index);
    likedRequest.onsuccess = (e) => {
        let user = likedRequest.result;
        user.liked = liked;
        store.put(user, index);
        liked ? console.log(`You liked ${user.name}`) : console.log(`You disliked ${user.name}`);
        if(liked === true) {
            const likeListEl = document.querySelector('.evaluation-display__list--likes');
            const likedUserEl = document.createElement('li');
            likedUserEl.setAttribute('class', 'liked-users');
            likedUserEl.textContent = user.name;
            likeListEl.append(likedUserEl);
            console.log(likedUserEl);
        } else if(liked === false){
            const dislikedListEl = document.querySelector('.evaluation-display__list--dislikes');
            const dislikedUserEl = document.createElement('li');
            dislikedUserEl.setAttribute('class', 'disliked-users');
            dislikedUserEl.textContent = user.name;
            dislikedListEl.append(dislikedUserEl);
            console.log(dislikedUserEl);
        }
    }
    likedRequest.onerror = (e) => {
        console.log(e);
    }
    return displayUser(index + 1);
}
function displayEvaluation() {
    const displayLikeEl = document.querySelector('.evaluation-display__button__like');
    const displayDislikeEl = document.querySelector('.evaluation-display__button__dislike');
    const likedListEl = document.querySelector('.evaluation-display__list--likes');
    const dislikedListEl = document.querySelector('.evaluation-display__list--dislikes');

    displayLikeEl.addEventListener('click', (e) => {
        console.log('display likes');
        likedListEl.classList.toggle('is-open');
    });
    displayDislikeEl.addEventListener('click', (e) => {
        console.log('display dislikes');
        dislikedListEl.classList.toggle('is-open');
    });
};
