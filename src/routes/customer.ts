/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { customerLogin, customerSignup, getCart, getCheckoutDetails, customerOrderHistory, addDelivery, logout } from '../controllers/customerController'

import { forgotPassword, verifyOTP, updatePassword, resetPassword, resetPasswordToken } from '../controllers/password'

import { verifyOTPEmailAuth } from '../controllers/emailverify'

import passport from 'passport'

import initializePayment from '../controllers/paystack'

const router = express.Router()

// login
router.post('/login', customerLogin)

// signup
router.post('/signup', customerSignup)

// get cart
router.get('/cart/:id', getCart)

// get checkout details
router.get('/checkout/:id', getCheckoutDetails)

// get customer order history
router.get('/orderhistory/:customerId', customerOrderHistory)

router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
)

router.post('/change-password', forgotPassword)

router.post('/otp-verification', verifyOTP)

router.post('/update-password/:id', updatePassword)

router.post('/otp-verifyEmail', verifyOTPEmailAuth)

router.post('/addDelivery', addDelivery)
router.post('/reset-password', resetPassword)

router.post('/reset-password/:token', resetPasswordToken)

router.post('/reset-password', resetPassword)

router.post('/reset-password/:token', resetPasswordToken)

router.post('/acceptpayment', initializePayment.acceptPayment)

router.get('/logout', logout);

export default router
