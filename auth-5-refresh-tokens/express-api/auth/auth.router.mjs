import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import ms from 'ms'
import cookieParser from 'cookie-parser'

const {CLIENT_ORIGIN, APP_SECRET, ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION} = process.env;

const router = express.Router()
router.use(cookieParser())

// Passport middleware for each OAuth provider
const facebookAuth = passport.authenticate('facebook', { session: false })
const githubAuth = passport.authenticate('github', { session: false })

// Triggered on the client
router.get('/facebook', facebookAuth)
router.get('/github', githubAuth)

// Triggered by each OAuth provider once the user has authenticated successfully
router.get('/facebook/callback', facebookAuth, (req, res) => {
    const { givenName, familyName } = req.user.name
    const user = { 
      name: `${givenName} ${familyName}`,
      photo: req.user.photos[0].value
    }
    redirect_tokens(req,res,user)
})
router.get('/github/callback', githubAuth , (req, res) => {
    const user = { 
      name: req.user.username,
      photo: req.user.photos[0].value
    }
    redirect_tokens(req,res,user)
})
function redirect_tokens(req,res,user){
    const access_token = jwt.sign({ id : req.user.id , some:'other value'}, APP_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRATION // expires in 1 minute
    })
    const refresh_token = jwt.sign({ id : req.user.id , profile:JSON.stringify(user)}, APP_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRATION // expires in 60 days... long-term... 
    })
    // const hour = 3600000;
    // res.cookie('refresh_token',refresh_token, {
    //   maxAge: 60 * 24 * hour, //60 days
    //   httpOnly: true
    // })
    res.cookie('refresh_token',refresh_token, {
      maxAge: ms('60d'), //60 days
      httpOnly: true
    })
    res.redirect(`${CLIENT_ORIGIN}?token=${access_token}&profile=${encodeURIComponent(JSON.stringify(user))}`)
}
router.get('/get-access-token',async (req,res)=> {
  //get refresh_token from client - req.cookies
  const {refresh_token} = req.cookies;

  console.log({refresh_token});

  if (!refresh_token) return res.status(403).json({
      status:'Unauthorized',
      payload: 'No refresh_token provided.'
  });

  try{
    // verifies secret and checks expiration
    const decoded = await jwt.verify(refresh_token, APP_SECRET)
    console.log({decoded})

    const {id, profile} = decoded;

    const access_token = jwt.sign({ id , some:'other value'}, APP_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRATION //expires in 1 minute
    })
    res.status(200).json({access_token, profile })
  }catch(err){
      console.log('error: ',err)
      return res.status(401).json({
          status:'Unauthorized',
          payload: 'Unauthorized - Failed to verify refresh_token.'
      });
  }   
})

router.get('/logout',(req,res)=>{
    req.logout();
    res.clearCookie('refresh_token');
    res.status(200).json({status:'You are logged out'})
})


export const verifyAuth = async (req, res, next) => {
  try {     
      // check header or url parameters or post parameters for token
      const access_token = req.headers['x-access-token'];

      if (!access_token) return res.status(403).json({
          status:'Unauthorized',
          payload: 'No token provided.'
      });

      // verifies secret and checks exp
      const decoded = await jwt.verify(access_token, APP_SECRET)

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
export default router;