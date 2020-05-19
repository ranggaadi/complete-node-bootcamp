const hideAlert = function(){
    const alertBox = document.querySelector('.alert');
    if(alertBox) alertBox.parentElement.removeChild(alertBox);
}

export const showAlert = function(type, msg){
    //memastikan tidak ada yang menumpuk maka di selalu run hideAlert terlebih dahulu
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

    window.setTimeout(hideAlert, 5000); //akan hilang dalam 5 detik;
}