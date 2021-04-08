const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const dotenv = require('dotenv')
dotenv.config()
const app = express();

const expressGoogleAnalytics = require('express-google-analytics');
if (process.env.GA_TRACKING_ID) {
    const analytics = expressGoogleAnalytics(process.env.GA_TRACKING_ID);
    app.use(analytics);
}
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "client/build")))

app.use('/api', indexRouter);

app.get("*", (req, res) => {
    return res.sendFile(path.join(__dirname, "/client/build/index.html"))
})


app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
