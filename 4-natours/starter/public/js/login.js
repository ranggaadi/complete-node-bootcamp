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