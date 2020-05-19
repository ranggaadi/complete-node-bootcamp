import "@babel/polyfill";
import { login, logout } from './login';
import { displayMap } from './mapbox';


const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');

// Tombol logout
const logoutBtn = document.querySelector('.nav__el--logout');

if(mapBox){
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if(logoutBtn){
    logoutBtn.addEventListener('click', logout);
}

if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value
        login(email, password);
    })
}