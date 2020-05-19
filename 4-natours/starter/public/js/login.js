const login = async (email, password) => {
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
            window.setTimeout(() => {
                location.assign('/');
            }, 1000);
        }
    }catch(err){
        alert(err.response.data.message);
    }
}

document.querySelector('.form').addEventListener('submit', function(e){
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value
    login(email, password);
})