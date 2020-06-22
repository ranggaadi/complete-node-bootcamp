import "@babel/polyfill";
import { login, logout, updateSettings } from './login';
import { displayMap } from './mapbox';


const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const updateUserForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-password');

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
        const form = new FormData();
        form.append("name", document.getElementById('name').value)
        form.append("email", document.getElementById('email').value)
        form.append("photo", document.getElementById('photo').files[0])

        updateSettings(form, 'data');
    })
}

if(updatePasswordForm){
    updatePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        //akan mencetak sejenis loading / proses pada button
        const btnSavePassword = document.querySelector('.btn--save-password');
        btnSavePassword.textContent = 'Updating ...';

        const oldPassword = document.getElementById('password-current').value;
        const newPassword = document.getElementById('password').value;
        const confirmPassword = document.getElementById('password-confirm').value;
        await updateSettings({oldPassword, newPassword, confirmPassword}, 'password');

        //menghapus / mengosongkan field dari password
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';

        //mengembalikan loading proses apabila proses await dari updateSettings sudah selesai
        btnSavePassword.textContent = 'Save Password';
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