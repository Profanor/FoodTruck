// Custom middleware to check if the user is logged in
import { type Request, type Response, type NextFunction } from 'express'

function isLoggedIn (req: Request, res: Response, next: NextFunction): void {
  req.user
    ? next()
    : res.status(401).json({
      message: 'Log in to access this resource'
    })
}

export default isLoggedIn
