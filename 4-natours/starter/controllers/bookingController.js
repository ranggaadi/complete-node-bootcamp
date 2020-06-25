const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.getCheckoutSession = catchAsync(async(req, res, next) => {
    // 1 mendapatkan tour yang diambil
    const tour = await Tour.findById(req.params.tourId)

    // 2 membentuk checkout session

    //PERINGATAN:
        // -pada bagian success_url querystring dari info tour dan user akan dijadikan sebagai acuan membuat booking
        // sehingga akan terdapat celah pada website karena mereka bisa membentuk booking tanpa bayar
        // hanya dengan memasukan querystring, akan lebih baik menggunakan stripe webhook namun hanya bisa
        // digunakan pada deployed website, maka untuk akal akalan saja akan diredirect secara sederhana

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'], //visa dkk
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`, //jika success maka redirect
        cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`, //jika gagal maka redirect
        customer_email: req.user.email, //karena sudah login pasti data user akan disimpan disini
        client_reference_id: req.params.tourId, //nanti akan dipergunakan dalam membentuk booking
        line_items: [ //item yang ditampilkan dalam pembayaran stripe
            {
                name: `${tour.name} tour`, //nama barang yang dijual
                description: tour.summary, //deskripsi barang
                amount: tour.price * 100, //harga barang dalam cent sehingga dikalikan 100 sehingga menjadi
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                currency: 'usd',
                quantity: 1
            }
        ]
    })

    //3 mengirim checkout output
    res.status(200).json({
        "status": "success",
        session
    });
})

exports.createBookingCheckout = catchAsync(async(req, res, next) => {
    const {tour, user, price} = req.query;

    if(tour && user && price){ //memastikan semua query string didapatkan
        await Booking.create({tour, user, price});
    }else{
        return next();
    }

    //akan langsung di redirect ke halaman utama agar tidak terlihat query stringnya
    res.redirect(req.originalUrl.split('?')[0]);
});