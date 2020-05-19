import "@babel/polyfill";
import { login, logout, updateUser } from './login';
import { displayMap } from './mapbox';


const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const updateUserForm = document.querySelector('.form-user-data');

// Tombol logout
const logoutBtn = document.querySelector('.nav__el--logout');

if(mapBox){
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if(logoutBtn){
    logoutBtn.addEventListener('click', logout);
}

if(updateUserForm){
    updateUserForm.addEventListener('submit', function(e){
        e.preventDefault();

        const username = document.getElementById('name').value
        const email = document.getElementById('email').value
        console.log(username, email);
        updateUser(username, email);
    })
}

if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value
        login(email, password);
    })
}