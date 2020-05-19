import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
    try{
        const res = await axios({
            method: 'POST',
            url: "http://localhost:8000/api/v1/users/login",
            data: {
                email,
                password
            }
        });

        if(res.data.status === "success"){
            showAlert('success', "Login successful!");
            window.setTimeout(() => {
                location.assign('/');
            }, 1000);
        }
    }catch(err){
        showAlert('error', err.response.data.message);
    }
}

export const logout = async (req, res) => {
    try{
        const res = await axios({
            method: 'GET',
            url: "http://localhost:8000/api/v1/users/logout"
        });

        if(res.data.status === "success"){
            location.reload(true);
        }
    }catch (err){
        showAlert('error', err.response.data.message);
    }
}

export const updateUser = async (username, email) => {
    try{
        const res = await axios({
            method: "PATCH",
            url: "http://localhost:8000/api/v1/users/update-profile",
            data: {
                name: username,
                email
            }
        })

        if(res.data.status === 'success'){
            showAlert('success', 'Updating profile success')
            location.reload(true);
        }
    }catch(err){
        showAlert('error', err.response.data.message);
    }
}