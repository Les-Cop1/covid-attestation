const QRCode = require('qrcode')
const PDFLib = require('pdf-lib');
const rgb = PDFLib.rgb;
const PDFDocument = PDFLib.PDFDocument;
const StandardFonts = PDFLib.StandardFonts;
let fs = require('fs')

const ys = {
    travail: 553,
    achats_culturel_cultuel: 482,
    sante: 434,
    famille: 410,
    handicap: 373,
    sport_animaux: 349,
    convocation: 276,
    missions: 252,
    enfants: 228,
}

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function generateQR(text) {
    const opts = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
    }
    return QRCode.toDataURL(text, opts)
}

async function generatePdf(profile, reason, pdfBase) {
    let today = new Date();
    today = new Date(today.getTime() - 5000 * 60)
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    let creationDate = dd + '/' + mm + '/' + yyyy;
    let creationDateTitre = yyyy + '-' + mm + '-' + dd;

    let h = addZero(today.getHours());
    let m = addZero(today.getMinutes());
    let creationHour = h + "h" + m
    let creationHourTitre = h + "-" + m
    const {
        lastname,
        firstname,
        birthday,
        placeofbirth,
        address,
        zipcode,
        city,
        datesortie,
        heuresortie,
    } = profile

    const data = [
        `Cree le: ${creationDate} a ${creationHour}`,
        `Nom: ${lastname}`,
        `Prenom: ${firstname}`,
        `Naissance: ${birthday} a ${placeofbirth}`,
        `Adresse: ${address} ${zipcode} ${city}`,
        `Sortie: ${datesortie} a ${heuresortie}`,
        `Motifs: ${reason}`,
    ].join(';\n ')

    const pdfDoc = await PDFDocument.load(fs.readFileSync(pdfBase))
    let title = 'attestation-' + creationDateTitre + "_" + creationHourTitre
    pdfDoc.setTitle(title)
    pdfDoc.setSubject('Attestation de déplacement dérogatoire')
    pdfDoc.setKeywords([
        'covid19',
        'covid-19',
        'attestation',
        'déclaration',
        'déplacement',
        'officielle',
        'gouvernement',
    ])
    pdfDoc.setProducer('DNUM/SDIT')
    pdfDoc.setCreator('Lucas & Félix')
    pdfDoc.setAuthor("Ministère de l'intérieur")

    const page1 = pdfDoc.getPages()[0]

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const drawText = (text, x, y, size = 11) => {
        page1.drawText(text, {x, y, size, font})
    }

    drawText(`${firstname} ${lastname}`, 92, 702)
    drawText(birthday, 92, 684)
    drawText(placeofbirth, 214, 684)
    drawText(`${address} ${zipcode} ${city}`, 104, 665)
    drawText('x', 47, ys[reason], 12)

    let locationSize = getIdealFontSize(font, profile.city, 83, 7, 11)

    if (!locationSize) {
        locationSize = 7
    }

    drawText(profile.city, 78, 76, locationSize)
    
    drawText(`${profile.datesortie}`, 63, 58, 11)
    drawText(`${profile.heuresortie}`, 227, 58, 11)

    const qrTitle1 = 'QR-code contenant les informations '
    const qrTitle2 = 'de votre attestation numérique'

    const generatedQR = await generateQR(data)

    const qrImage = await pdfDoc.embedPng(generatedQR)

    page1.drawText(qrTitle1 + '\n' + qrTitle2, { x: 440, y: 130, size: 6, font, lineHeight: 10, color: rgb(1,1,1) })


    page1.drawImage(qrImage, {
        x: page1.getWidth() - 156,
        y: 25,
        width: 92,
        height: 92,
    })

    pdfDoc.addPage()
    const page2 = pdfDoc.getPages()[1]
    page2.drawText(qrTitle1 + qrTitle2, { x: 50, y: page2.getHeight() - 70, size: 11, font, color: rgb(1,1,1) })
    page2.drawImage(qrImage, {
        x: 50,
        y: page2.getHeight() - 390,
        width: 300,
        height: 300,
    })

    return {"file":await pdfDoc.save(), title};

}


function getIdealFontSize(font, text, maxWidth, minSize, defaultSize) {
    let currentSize = defaultSize
    let textWidth = font.widthOfTextAtSize(text, defaultSize)

    while (textWidth > maxWidth && currentSize > minSize) {
        textWidth = font.widthOfTextAtSize(text, --currentSize)
    }

    return textWidth > maxWidth ? null : currentSize
}

module.exports = {generatePdf}