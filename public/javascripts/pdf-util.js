const QRCode = require('qrcode')
const PDFLib = require('pdf-lib')
const PDFDocument = PDFLib.PDFDocument
const PageSizes = PDFLib.PageSizes
const rgb = PDFLib.rgb
const fontkit = require('@pdf-lib/fontkit')
const dateformat = require('dateformat')
let fs = require('fs')
const fetch = require("node-fetch");

const LucioleFontBase = '/public/assets/fonts/Luciole-Regular.ttf'
const LucioleBoldFontBase = '/public/assets/fonts/Luciole-Bold.ttf'
const LucioleItalicFontBase = '/public/assets/fonts/Luciole-Regular-Italic.ttf'
const LucioleBoldItalicFontBase = '/public/assets/fonts/Luciole-Bold-Italic.ttf'

const curfewPdfData = '../assets/curfew-pdf-data.js'
const quarantinePdfData = '../assets/quarantine-pdf-data.js'

const pixelHeight = 1262
const pixelRatio = 1.49845450880258
const sizeRatio = 0.66

const generatePdf = async (profile, reason,  mode, url) => {
    // Date de création du fichier x minutes avant la date de sortie
    let pdfDoc
    let title
    if (mode !== undefined) {
        const minutesBefore = 5
        let pdfData

        if (mode === 'jour') {
            pdfData = quarantinePdfData
        } else {
            pdfData = curfewPdfData
        }

        const {
            lastname,
            firstname,
            birthday,
            address,
            zipcode,
            city,
            datesortie,
            heuresortie,
        } = profile

        const dateSortieFormated = `${datesortie.substr(6, 4)}-${datesortie.substr(3, 2)}-${datesortie.substr(0, 2)}`
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
            `Naissance: ${birthday}`,
            `Adresse: ${address} ${zipcode} ${city}`,
            `Sortie: ${datesortie} a ${heuresortie}`,
            `Motifs: ${reason}`,
            '', // Pour ajouter un ; aussi au dernier élément
        ].join(';\n ')

        pdfDoc = await PDFDocument.create()
        pdfDoc.registerFontkit(fontkit)
        pdfDoc.addPage(PageSizes.A4)

        title = 'attestation-' + creationDateTitre + "_" + creationHourTitre
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
        console.log(url)
        console.log(new URL(LucioleFontBase, "https://"+url).href)
        let fontBuffer = await fetch(new URL(LucioleFontBase, "https://"+url).href).then(res => res.arrayBuffer())
        const fontLuciole = await pdfDoc.embedFont(fontBuffer)
        fontBuffer = await fetch(new URL(LucioleBoldFontBase, "https://"+url).href).then(res => res.arrayBuffer())
        const fontLucioleBold = await pdfDoc.embedFont(fontBuffer)
        fontBuffer = await fetch(new URL(LucioleItalicFontBase, "https://"+url).href).then(res => res.arrayBuffer())
        const fontLucioleItalic = await pdfDoc.embedFont(fontBuffer)
        fontBuffer = await fetch(new URL(LucioleBoldItalicFontBase, "https://"+url).href).then(res => res.arrayBuffer())
        const fontLucioleBoldItalic = await pdfDoc.embedFont(fontBuffer)

        let pages = pdfDoc.getPages()
        let pageIdx = 0
        let page = pages[0]
        let x = 0
        let y = 0
        let size = 0
        let font = fontLuciole

        pdfData.forEach(item => {
            const itemPageIdx = item.page - 1 || 0
            if (itemPageIdx !== pageIdx) {
                if (item.page > pages.length) {
                    pdfDoc.addPage(PageSizes.A4)
                    pages = pdfDoc.getPages()
                }
                pageIdx = itemPageIdx
                page = pages[pageIdx]
            }
            x = 0
            y = 0
            size = Number((item.size * sizeRatio).toFixed(2)) || 10
            font = item.font === 'LucioleBold'
                ? fontLucioleBold
                : item.font === 'LucioleItalic'
                    ? fontLucioleItalic
                    : item.font === 'LucioleBoldItalic'
                        ? fontLucioleBoldItalic
                        : fontLuciole

            if (item.top) {
                x = item.left / pixelRatio
                y = (pixelHeight - item.top) / pixelRatio
            } else {
                x = item.x
                y = item.y
            }
            const label = item.label || ''
            let text = item.variablesNames ? item.variablesNames.reduce((acc, name) => acc + ' ' + profile[name], label) : label
            if (item.type === 'text') {
                page.drawText(text, { x, y, size, font })
            }
            if (item.type === 'input') {
                text = item.inputs.reduce((acc, cur) => acc + ' ' + profile[cur], text)
                page.drawText(text, { x, y, size, font })
            }
            if (item.type === 'checkbox') {
                const xc = x - 16
                const checkbox = reasons.split(', ').includes(item.reason) ? '[x]' : '[ ]'
                page.drawText(checkbox, { x: xc, y, size, font })
                page.drawText(label, { x, y, size, font })
            }
        })

        const qrTitle1 = 'QR-code contenant les informations '
        const qrTitle2 = 'de votre attestation numérique'

        const generatedQR = await generateQR(data)

        const qrImage = await pdfDoc.embedPng(generatedQR)
        const pageX0 = pdfDoc.getPages()[0]
        pageX0.drawText(qrTitle1 + '\n' + qrTitle2, { x: 470, y: 121, size: 6, font, lineHeight: 10, color: rgb(1, 1, 1) })
        pageX0.drawImage(qrImage, {
            x: pageX0.getWidth() - 107,
            y: 21,
            width: 82,
            height: 82,
        })

        pdfDoc.addPage()
        const pageX = pdfDoc.getPages()[1]
        pageX.drawText(qrTitle1 + qrTitle2, { x: 50, y: pageX.getHeight() - 70, size: 11, font, color: rgb(1, 1, 1) })
        pageX.drawImage(qrImage, {
            x: 50,
            y: pageX.getHeight() - 390,
            width: 300,
            height: 300,
        })
    } else {
        pdfDoc = await PDFDocument.load(fs.readFileSync('../assets/update-shortcut.pdf'))
    }

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

module.exports = {generatePdf}
