var express = require('express');
var router = express.Router();

const pdfUtils = require('../public/javascripts/pdf-util')

router.get('/', function (req, res, next) {

    res.status(400).send({
        success: false,
        error: "Bad request",
        documentation: "https://github.com/Les-Cop1/covid-attesation"
    });
})

/* POST home page. */
router.post('/', function (req, res, next) {
    let reason = (req.body["motif"] === undefined) ? '' : req.body["motif"]
    if (reason==="achats") reason="achats_culturel_cultuel"

    let adresse = (req.body["adresse"] === undefined) ? '' : req.body["adresse"];
    let dateNaissance = (req.body["dateNaissance"] === undefined) ? '' : req.body["dateNaissance"]
    let ville = (req.body["ville"] === undefined) ? '' : req.body["ville"]
    let dateSortie = (req.body["dateSortie"] === undefined) ? '' : req.body["dateSortie"]
    let prenom = (req.body["prenom"] === undefined) ? '' : req.body["prenom"]
    let heureSortie = (req.body["heureSortie"] === undefined) ? '' : req.body["heureSortie"]
    let nom = (req.body["nom"] === undefined) ? '' : req.body["nom"]
    let lieuNaissance = (req.body["lieuNaissance"] === undefined) ? '' : req.body["lieuNaissance"]
    let codePostal = (req.body["codePostal"] === undefined) ? '' : req.body["codePostal"]

    let profile = {
        "address": adresse,
        "birthday": dateNaissance,
        "city": ville,
        "datesortie": dateSortie,
        "firstname": prenom,
        "heuresortie": heureSortie,
        "lastname": nom,
        "ox - achats": "achats",
        "ox - convocation": "convocation",
        "ox - enfants": "enfants",
        "ox - famille": "famille",
        "ox - handicap": "handicap",
        "ox - missions": "missions",
        "ox - sante": "sante",
        "ox - sport_animaux": "sport_animaux",
        "ox - travail": "travail",
        "placeofbirth": lieuNaissance,
        "zipcode": codePostal
    }

    getBuffer(profile, reason)
        .then(function (pdf) {
            res.type('pdf');
            res.setHeader("Content-disposition", 'filename="' + pdf.title + '.pdf"')
            res.send(Buffer.from(pdf.file))
        })
});

async function getBuffer(profile, reason) {
    return await pdfUtils.generatePdf(profile, reason, './public/assets/certificate.pdf');
}


module.exports = router;
