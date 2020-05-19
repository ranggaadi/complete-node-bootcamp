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

export const updateSettings = async (data, type) => {

    const url = type === 'data' ? "http://localhost:8000/api/v1/users/update-profile" 
                            : "http://localhost:8000/api/v1/users/update-password";
    try{
        const res = await axios({
            method: "PATCH",
            url,
            data
        })

        if(res.data.status === 'success'){
            showAlert('success', `Updating ${type === 'data' ?  type+' profile' : type } success`)
            location.reload(true);
        }
    }catch(err){
        showAlert('error', err.response.data.message);
    }
}