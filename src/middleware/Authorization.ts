import { type Request, type Response } from 'express'
import jwt from 'jsonwebtoken'
import Customer from '../models/Customer'
import Restaurant from '../models/Restaurant'

const secret: string = (process.env.secret ?? '')

export async function checkAndVerifyCustomerToken (req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies.token

    if (!token) {
      res.json({ noTokenError: 'Unauthorized - Token not provided' })
    } else {
      const decoded = jwt.verify(token, secret) as { loginkey: string }
      const customer = await Customer.findOne({
        where: { id: decoded.loginkey }
      })
      console.log('customer', customer)
      res.json({ customer })

      // req.customer = { id: customer?.dataValues.id }
    }
  } catch (error: any) {
    console.log('error', error)
    if (error.name === 'TokenExpiredError') {
      console.log('expired', error)

      res.json({ tokenExpiredError: 'Unauthorized - Token has expired' })
    } else {
      console.log('unknown', error)

      res.json({ verificationError: 'Unauthorized - Token verification failed' })
    }
  }
}

export async function checkAndVerifyRestaurantToken (req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies.token

    if (!token) {
      res.json({ noTokenError: 'Unauthorized - Token not provided' })
    } else {
      const decoded = jwt.verify(token, secret) as { loginkey: string }
      const restaurant = await Restaurant.findOne({
        where: { id: decoded.loginkey }
      })
      console.log('restaurant', restaurant)
      res.json({ restaurant })

      // req.customer = { id: customer?.dataValues.id }
    }
  } catch (error: any) {
    console.log('error', error)
    if (error.name === 'TokenExpiredError') {
      console.log('expired', error)

      res.json({ tokenExpiredError: 'Unauthorized - Token has expired' })
    } else {
      console.log('unknown', error)

      res.json({ verificationError: 'Unauthorized - Token verification failed' })
    }
  }
}
