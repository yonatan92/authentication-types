import express from 'express'
import morgan from 'morgan'
import log from '@ajar/marker'
import cors from 'cors'
import ms from 'ms'
import session from 'express-session'
import passport from 'passport'
import passport_config from './auth/passport.config.mjs'
import auth_router from './auth/auth.router.mjs'

const { PORT,HOST, APP_SECRET } = process.env;

const app = express();

// apply middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'))

passport_config()

app.use(session({ 
    secret: APP_SECRET, 
    cookie: { maxAge: ms('30s') }
}))

app.use(passport.initialize())
app.use(passport.session());

// log.magenta('verifyAuth',req.url)
// log.obj(req.session,'req.session:')
const verifyAuth = (req,res,next)=>{
    // log.obj({user:req.user},'verifyAuth - req.user:')
    if(req.user){
        next()
    }else{
        res.status(403).json({status:'unauthorized',payload:'You are unauthorized to access this route'})
    }
}

app.use('/api/auth/', auth_router);

app.get('/api/protected',verifyAuth,(req,res)=>{
    res.status(200).json({status:'OK',payload:'some sensitive data'})
})

//when no routes were matched...
app.use('*', (req,res)=> {
    res.status(404).json({status:`path ${req.url} is not found`})
});

//start the express api server
(async ()=> { 
  await app.listen(PORT,HOST);
  log.magenta(`api is live on`,` ✨ ⚡  http://${HOST}:${PORT} ✨ ⚡`);  
})().catch(log.error)