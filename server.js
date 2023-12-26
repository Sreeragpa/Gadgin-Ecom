const express = require('express');
const dbConnect = require('./configs/dbConnect');
const app = express();
const methodOverride = require('method-override')
const dotenv = require('dotenv').config()
const PORT = process.env.PORT || 4000;
const path = require('path')
const userRoutes = require('./routes/userRoutes')
const authRoutes = require('./routes/authRoutes')
const adminRoutes= require('./routes/adminRoutes')
const apiRoutes= require('./routes/apiRoutes')
const passport = require('./configs/passport-config');
const session = require('express-session')
const flash = require('express-flash');
const errorMiddleware = require('./middlewares/errorMiddleware');
const cors = require('cors')
dbConnect();

app.use(session({
    cookie: { maxAge: 600000 },
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false

}))
app.use(passport.initialize())
app.use(passport.session())

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(methodOverride('_method'));
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname,'public')))
app.use(flash())
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); 
    res.setHeader("Pragma", "no-cache"); 
    res.setHeader("Expires", "0"); 
    next()
})



app.use('/',userRoutes)
app.use('/',authRoutes)
app.use('/admin',adminRoutes);
app.use('/api',apiRoutes);

// Error Middleware
app.use(errorMiddleware);

app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})
