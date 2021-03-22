const express = require('express');
const router = express.Router();

const pdfUtils = require('../public/javascripts/pdf-util')

router.get('/', function (req, res, next) {

    res.status(400).send({
        success: false,
        error: "Bad request",
        documentation: "https://github.com/Les-Cop1/covid-attesation"
    });
})

/* POST home page. */
router.post('/', (req, res, next) => {

    if (req.body.mode === "jour") {

    } else if (req.body.mode === "nuit") {

    } else {
        res.send({success: false, error: "Veuillez mettre à jour le raccourci"})
    }

    let reason = (req.body["motif"] === undefined) ? '' : req.body["motif"]

    let profile = {
        "address": (req.body["adresse"] === undefined) ? '' : req.body["adresse"],
        "birthday": (req.body["dateNaissance"] === undefined) ? '' : req.body["dateNaissance"],
        "city": (req.body["ville"] === undefined) ? '' : req.body["ville"],
        "datesortie": (req.body["dateSortie"] === undefined) ? '' : req.body["dateSortie"],
        "firstname": (req.body["prenom"] === undefined) ? '' : req.body["prenom"],
        "heuresortie": (req.body["heureSortie"] === undefined) ? '' : req.body["heureSortie"],
        "lastname": (req.body["nom"] === undefined) ? '' : req.body["nom"],
        "placeofbirth": (req.body["lieuNaissance"] === undefined) ? '' : req.body["lieuNaissance"],
        "zipcode": (req.body["codePostal"] === undefined) ? '' : req.body["codePostal"]
    }

    getBuffer(profile, reason, req.body.mode)
        .then(function (pdf) {
            res.type('pdf');
            res.setHeader("Content-disposition", 'filename="' + pdf.title + '.pdf"')
            res.send(Buffer.from(pdf.file))
        })
});

async function getBuffer(profile, reason, mode) {
    let pdf
    if (mode === "jour") {
        pdf = './public/assets/quarantine-certificate.pdf'
    } else if (mode === "nuit") {
        pdf = './public/assets/curfew-certificate.pdf'
    } else {
        pdf = './public/assets/update-shortcut.pdf'
    }
    return await pdfUtils.generatePdf(profile, reason, pdf, mode);
}


module.exports = router;
