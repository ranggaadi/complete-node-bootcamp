exports.getOverview = (req, res) => {
    res.status(200).render('pages/overview', {
        title: "All Tours"
    })
}

exports.getTour = (req, res) => {
    res.status(200).render('pages/tour', {
        title: "The Forest Hiker"
    })
}