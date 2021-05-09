import express from 'express'
import morgan from 'morgan'
import log from '@ajar/marker'
import cors from 'cors'
import ms from 'ms'
import session from 'express-session'
/* 
    Note:
    express-session is meant for debugging only
    two recommended production alternatives are
    - mongodb - https://www.npmjs.com/package/connect-mongo
    - redis - https://github.com/tj/connect-redis 

    also - express-session has built-in support for cookies
    no need for cookie-parser middleware - https://www.npmjs.com/package/cookie-parser
*/

const { PORT,HOST, APP_SECRET } = process.env;

const app = express();

// apply middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'))
app.use(session({ 
    secret: APP_SECRET, 
    cookie: { maxAge: ms('30s') }
}))


// log.magenta('verifyAuth',req.url)
// log.obj(req.session,'req.session:')
const verifyAuth = (req,res,next)=>{
    if(req.session.user){
        next()
    }else{
        res.status(403).json({status:'unauthorized',payload:'You are unauthorized to access this route'})
    }
}

// simple hard-coded demo...
const testUser = {
    id : 'wxw9e76wefgdqoeudyew8',
    first_name : 'Shlomo',
    last_name : 'Baraba',
    email : 'baraba@acum.com',
    password : 'qwerty',
}
app.post('/api/login', (req,res)=> {
    log.obj(req.body,'body')
    const {email,password} = req.body;
    if(email === testUser.email && password === testUser.password){
        req.session.user = testUser;
        log.obj(req.session,'set req.session:')
        const payload = {...testUser};
        delete payload.password;
        res.status(200).json({status:'you are authenticated', user:payload})
    }else{
        res.status(403).json({status:'wrong email or password'})
    }
});
app.get('/api/logout',(req,res)=>{
    req.session.user = null;
    res.status(200).json({status:'You are logged out'})
})
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