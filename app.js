const express = require('express');
const app = express();
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);

const path = require('path');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));



const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');


main().then((res) => {
    console.log("connection");
})
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wonderlust');
}



app.listen(8080, () => {
    console.log('Server is running on port 8080');
});

app.get('/', (req, res) => {
    res.render('home/home');
});