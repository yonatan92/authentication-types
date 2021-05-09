import express from 'express'
import morgan from 'morgan'
import log from '@ajar/marker'
import cors from 'cors'
import jwt from 'jsonwebtoken';

const { PORT ,HOST , APP_SECRET, TOKEN_EXPIRATION } = process.env;

const app = express();

// apply middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'))

// log.magenta('verifyAuth',req.url)
const verifyAuth = async (req, res, next) => {
    try {     
        // check header or url parameters or post parameters for token
        const token = req.headers['x-access-token'];

        if (!token) return res.status(403).json({
            status:'Unauthorized',
            payload: 'No token provided.'
        });

        // verifies secret and checks exp
        const decoded = await jwt.verify(token, APP_SECRET)

        // if everything is good, save to request for use in other routes
        req.user_id = decoded.id;
        next();

    } catch (error) {
        return res.status(401).json({
            status:'Unauthorized',
            payload: 'Unauthorized - Failed to authenticate token.'
        });
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
        
        // create a token
        const token = jwt.sign({ id : testUser.id , some:'other value'}, APP_SECRET, {
            expiresIn: TOKEN_EXPIRATION // expires in 1 minute for debugging...
        })

        const payload = {...testUser};
        delete payload.password;

        res.status(200).json({
            status:'you are authenticated', 
            payload,
            token
        })

    }else{
        res.status(403).json({
            status:'Unauthorized',
            payload: 'wrong email or password'
        })
    }
});
app.get('/api/logout',(req,res)=>{
    // client app can logout, but on the server - 
    // since there is no session anymore
    // we cannot really log the user out for now
    // nor invalidate the token since it doesn't involve the db
    res.status(200).json({status:'You are logged out... kinda... 🧐'})
})

app.get('/api/protected',verifyAuth,(req,res)=>{
    log.v('req.user_id:',req.user_id)
    res.status(200).json({
        status:'OK',
        payload:'some sensitive data'
    })
})
app.get('/api/me',verifyAuth,(req,res)=>{
    log.v('req.user_id:',req.user_id)
    const payload = {...testUser};
    delete payload.password;
    res.status(200).json({
        status:'OK',
        payload
    })
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