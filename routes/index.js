var express = require('express');
var router = express.Router();
const pdfUtils = require('../public/javascripts/pdf-util')

/* POST home page. */
router.post('/', function (req, res, next) {


    let reasons = ["travail", "achats", "sante", "famille", "handicap", "sport_animaux", "convocation", "missions", "enfants"]

    const reason = reasons[1]
    let profile = {
        "address": req.body["adresse"],
        "birthday": req.body["dateNaissance"],
        "city": req.body["ville"],
        "datesortie": req.body["dateSortie"],
        "firstname": req.body["prenom"],
        "heuresortie": req.body["heureSortie"],
        "lastname": req.body["nom"],
        "ox - achats": "achats",
        "ox - convocation": "convocation",
        "ox - enfants": "enfants",
        "ox - famille": "famille",
        "ox - handicap": "handicap",
        "ox - missions": "missions",
        "ox - sante": "sante",
        "ox - sport_animaux": "sport_animaux",
        "ox - travail": "travail",
        "placeofbirth": req.body["lieuNaissance"],
        "zipcode": req.body["codePostal"]
    }

    getBuffer(profile, reason)
        .then(function (pdf) {
            res.type('pdf');
            res.setHeader("Content-disposition",  'filename="'+pdf.title+'.pdf"')
            res.send(Buffer.from(pdf.file))
        })

});

async function getBuffer(profile, reason) {
    return await pdfUtils.generatePdf(profile, reason, './public/assets/certificate.pdf');
}

module.exports = router;
