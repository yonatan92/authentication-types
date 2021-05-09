import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'

const router = express.Router()

const {CLIENT_ORIGIN, APP_SECRET, TOKEN_EXPIRATION} = process.env;

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
    const token = jwt.sign({ id : req.user.id , some:'other value'}, APP_SECRET, {
        expiresIn: TOKEN_EXPIRATION // expires in 1 minute for debugging...
    })
    res.redirect(`${CLIENT_ORIGIN}?token=${token}&profile=${encodeURIComponent(JSON.stringify(user))}`)
})
router.get('/github/callback', githubAuth , (req, res) => {
    const user = { 
      name: req.user.username,
      photo: req.user.photos[0].value
    }
    const token = jwt.sign({ id : req.user.id , some:'other value'}, APP_SECRET, {
      expiresIn: TOKEN_EXPIRATION // expires in 1 minute for debugging...
  })
  res.redirect(`${CLIENT_ORIGIN}?token=${token}&profile=${encodeURIComponent(JSON.stringify(user))}`)
})
router.get('/logout',(req,res)=>{
    req.logout();
    res.status(200).json({status:'You are logged out'})
})

export const verifyAuth = async (req, res, next) => {
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
export default router;