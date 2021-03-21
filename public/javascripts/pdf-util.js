const QRCode = require('qrcode')
const PDFLib = require('pdf-lib');
const rgb = PDFLib.rgb;
const PDFDocument = PDFLib.PDFDocument;
const StandardFonts = PDFLib.StandardFonts;
const dateformat = require('dateformat')
let fs = require('fs')

const generatePdf = async (profile, reason, pdfBase, mode) => {
    // Date de création du fichier x minutes avant la date de sortie
    const minutesBefore = 5

    let positions

    if (mode === 'jour') {
        positions = {
            sport: { page: 1, y: 367 },
            achats: { page: 1, y: 244 },
            enfants: { page: 1, y: 161 },
            culte_culturel: { page: 2, y: 781 },
            demarche: { page: 2, y: 726 },
            travail: { page: 2, y: 629 },
            sante: { page: 2, y: 533 },
            famille: { page: 2, y: 477 },
            handicap: { page: 2, y: 422 },
            judiciaire: { page: 2, y: 380 },
            demenagement: { page: 2, y: 311 },
            transit: { page: 2, y: 243 },
        }
    } else {
        positions = {
            travail: { page: 1, y: 579 },
            sante: { page: 1, y: 546 },
            famille: { page: 1, y: 512 },
            handicap: { page: 1, y: 478 },
            judiciaire: { page: 1, y: 458 },
            missions: { page: 1, y: 412 },
            transit: { page: 1, y: 379 },
            animaux: { page: 1, y: 345 },
        }
    }

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

    const dateSortieFormated = `${datesortie.substr(6,4)}-${datesortie.substr(3,2)}-${datesortie.substr(0,2)}`
    let date = new Date(`${dateSortieFormated} ${heuresortie}`)

    date.setMinutes(date.getMinutes() - minutesBefore)

    const creationDate = dateformat(date, "dd/mm/yyyy")
    const creationDateTitre = dateformat(date, "isoDate")
    const creationHour = dateformat(date, "HH'h'MM")
    const creationHourTitre = dateformat(date, "HH-MM")

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
    const page2 = pdfDoc.getPages()[1]

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const drawText = (text, x, y, size = 11) => {
        page1.drawText(text, { x, y, size, font })
    }
    const drawText2 = (text, x, y, size = 11) => {
        page2.drawText(text, { x, y, size, font })
    }

    let locationSize = getIdealFontSize(font, profile.city, 83, 7, 11)

    if (!locationSize) {
        locationSize = 7
    }

    let reasonX = 73
    if (mode === 'jour') {
        drawText(`${firstname} ${lastname}`, 111, 516)
        drawText(birthday, 111, 501)
        drawText(placeofbirth, 228, 501)
        drawText(`${address} ${zipcode} ${city}`, 126, 487)

        drawText2(`Fait à ${profile.city}`, 72, 99, locationSize)
        drawText2(`Le ${profile.datesortie}`, 72, 83, 11)
        drawText2(`à ${profile.heuresortie}`, 310, 83, 11)
        drawText2('(Date et heure de début de sortie à mentionner obligatoirement)', 72, 67, 11)
        reasonX = 60
    } else {
        drawText(`${firstname} ${lastname}`, 144, 705)
        drawText(birthday, 144, 684)
        drawText(placeofbirth, 310, 684)
        drawText(`${address} ${zipcode} ${city}`, 148, 665)

        drawText(`Fait à ${profile.city}`, 72, 109, locationSize)
        drawText(`Le ${profile.datesortie}`, 72, 93, 11)
        drawText(`à ${profile.heuresortie}`, 310, 93, 11)
        drawText('(Date et heure de début de sortie à mentionner obligatoirement)', 72, 77, 11)
    }

    positions[reason].page === 2 ? drawText2('x', reasonX, positions[reason].y || 0, 12) : drawText('x', reasonX, positions[reason].y || 0, 12)


    const qrTitle1 = 'QR-code contenant les informations '
    const qrTitle2 = 'de votre attestation numérique'

    const generatedQR = await generateQR(data)

    const qrImage = await pdfDoc.embedPng(generatedQR)
    let pageX0 = pdfDoc.getPages()[0]
    if (mode === 'jour') {
        pageX0 = pdfDoc.getPages()[2 - 1]
    }
    pageX0.drawText(qrTitle1 + '\n' + qrTitle2, { x: 470, y: 182, size: 6, font, lineHeight: 10, color: rgb(1, 1, 1) })

    pageX0.drawImage(qrImage, {
        x: pageX0.getWidth() - 107,
        y: 80,
        width: 82,
        height: 82,
    })

    pdfDoc.addPage()
    let pageX = pdfDoc.getPages()[1]
    if (mode === 'jour') {
        pageX = pdfDoc.getPages()[2]
    }
    pageX.drawText(qrTitle1 + qrTitle2, { x: 50, y: pageX.getHeight() - 70, size: 11, font, color: rgb(1, 1, 1) })
    pageX.drawImage(qrImage, {
        x: 50,
        y: pageX.getHeight() - 390,
        width: 300,
        height: 300,
    })

    return {"file": await pdfDoc.save(), title};

}

const generateQR = (text) => {
    const opts = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
    }
    return QRCode.toDataURL(text, opts)
}

const getIdealFontSize = (font, text, maxWidth, minSize, defaultSize) => {
    let currentSize = defaultSize
    let textWidth = font.widthOfTextAtSize(text, defaultSize)

    while (textWidth > maxWidth && currentSize > minSize) {
        textWidth = font.widthOfTextAtSize(text, --currentSize)
    }

    return textWidth > maxWidth ? null : currentSize
}

module.exports = {generatePdf}
