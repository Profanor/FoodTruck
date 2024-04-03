/* eslint-disable @typescript-eslint/no-non-null-assertion */
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth2'
import { type Request } from 'express'
import dotenv from 'dotenv'

dotenv.config()

passport.use(
  new GoogleStrategy(
    {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:4000/auth/google/callback',
      passReqToCallback: true
    },
    (
      request: Request,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) => {
      console.log('ACCESS TOKEN:', accessToken)
      // const grantedScopes = profile.json.scope.split(' ')

      // console.log('Granted Scopes:', grantedScopes)
      done(null, profile)
    }
  )
)

passport.serializeUser((user: any, done) => {
  done(null, user)
})

passport.deserializeUser((user: any, done) => {
  done(null, user)
})

export default passport
