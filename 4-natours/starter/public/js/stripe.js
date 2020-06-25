import axios from 'axios'
import { showAlert } from './alerts';
const stripe = Stripe("pk_test_51GxYQMFFq7aGE20rH8KaDKOFhUHULHU4Fc9xzghIx35hBtf1t1B93IE54aFAYC9vRoVWzNrqIt3qx6cPvcltDGOj00lonU9f5v")

export const bookTour = async tourId => {
    try {
        // 1. dapatkan session dari server API
        const session = await axios(`http://localhost:8000/api/v1/bookings/checkout-session/${tourId}`);
        console.log(session)
    
        //2. membuat form checkout + proses penarikan kartu credit
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });

    } catch (error) {
        console.log(error);
        showAlert("error", error)
    }
}