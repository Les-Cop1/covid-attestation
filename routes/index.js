const express = require('express');
const router = express.Router();
const v1_5 = require('../attestations/1.5/1.5')

const cors = require("cors")
let corsOptions = {}
if (process.env.ENVIRONEMENT === 'dev') {
    let whitelist = ['http://localhost:3000']
    corsOptions = {
        origin: function (origin, callback) {
            if (whitelist.indexOf(origin) !== -1) {
                callback(null, true)
            } else {
                callback(new Error('Not allowed by CORS'))
            }
        }
    }
}

router.get('/getLastShortcut', cors(), (req, res, next) => {
    res.send({
        shortcut: process.env.SHORTCUT
    })
})

router.post('/1.5', async (req, res, next) => {
    const {file, title} = await v1_5(req.body)
    res.type('pdf');
    res.setHeader("Content-disposition", 'filename="' + title + '.pdf"')
    res.send(Buffer.from(file))
});

module.exports = router;
