import express from 'express'
import log from '@ajar/marker'
import passport from 'passport'

const router = express.Router()

const {CLIENT_ORIGIN} = process.env;

// Passport middleware for each OAuth provider
const facebookAuth = passport.authenticate('facebook')
const githubAuth = passport.authenticate('github')

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
    res.redirect(`${CLIENT_ORIGIN}?profile=${encodeURIComponent(JSON.stringify(user))}`)
})
router.get('/github/callback', githubAuth , (req, res) => {
    const user = { 
      name: req.user.username,
      photo: req.user.photos[0].value
    }
    res.redirect(`${CLIENT_ORIGIN}?profile=${encodeURIComponent(JSON.stringify(user))}`)
})
router.get('/logout',(req,res)=>{
    req.logout();
    res.status(200).json({status:'You are logged out'})
})

export default router;