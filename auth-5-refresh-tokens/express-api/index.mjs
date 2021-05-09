import express from 'express'
import morgan from 'morgan'
import log from '@ajar/marker'
import cors from 'cors'
import passport from 'passport'
import passport_config from './auth/passport.config.mjs'
import auth_router,{verifyAuth} from './auth/auth.router.mjs'

const { PORT,HOST } = process.env;

const app = express();

// apply middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'))

passport_config()

app.use(passport.initialize())
app.use(passport.session());

app.use('/api/auth/', auth_router);

app.get('/api/protected',verifyAuth,(req,res)=>{
    res.status(200).json({status:'OK',payload:`some sensitive data on user id ${req.user_id}`})
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