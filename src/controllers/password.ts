import { type Request, type Response } from 'express'
import Customer from '../models/Customer'
import Restaurant from '../models/Restaurant'
import Admin from '../models/Admin'
import speakeasy from 'speakeasy'
import nodemailer from 'nodemailer'
import bcrypt from 'bcryptjs'
import Joi from 'joi'
import crypto from 'crypto'

// Store OTPs and their timestamps for multiple users
const otpStore = new Map<string, { otp: string, timestamp: number }>()

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email } = req.body

    const existingOTPData = otpStore.get(email)

    if (existingOTPData) {
      const now = Date.now()
      const difference = now - existingOTPData.timestamp
      const diffMinutes = Math.floor(difference / 1000 / 60)

      if (diffMinutes < 1) {
        return res.status(400).json({
          error: 'OTP already sent. Please try again after 60 seconds'
        })
      }
    }

    const otp = speakeasy.totp({
      secret: speakeasy.generateSecret().base32,
      encoding: 'base32'
    })

    otpStore.set(email, { otp, timestamp: Date.now() })

    // req.session.userEmail = email;

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USERS,
        pass: process.env.PASSWORD
      }
    })

    const mailOptions = {
      from: process.env.USER,
      to: email,
      subject: 'Your FoodTruck Password Reset OTP',
      text: `Please use the OTP code: ${otp} to reset your password`
    }

    await transporter.sendMail(mailOptions)

    res.json({ message: 'OTP sent successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

export async function verifyOTP (req: Request, res: Response): Promise<any> {
  try {
    const { email, otp } = req.body

    // Retrieving the user's email from the session
    // const email = req.session.userEmail

    // Check if userEmail is defined before using it
    if (email === undefined) {
      return res.status(400).json({
        error:
          'User email could not be retrieved. Please try again or contact support.'
      })
    }

    const existingOTPData = otpStore.get(email)

    if (existingOTPData) {
      const now = Date.now()
      const difference = now - existingOTPData.timestamp
      const diffMinutes = Math.floor(difference / 1000 / 60)

      if (diffMinutes >= 5) {
        return res.status(400).json({
          error:
            'OTP has expired. Please request a new OTP for password reset.'
        })
      }

      if (existingOTPData.otp !== otp) {
        return res.status(400).json({
          error:
            'Invalid OTP. Please enter the correct OTP for password reset.'
        })
      }

      otpStore.delete(email)

      // Redirect to the page where the user can enter a new password
      //   res.redirect('/reset-password');
      return res.json({
        message: 'OTP verification successful. You can now reset your password.'
      })
    } else {
      return res.status(400).json({
        error:
          'No valid OTP found. Please request a new OTP for password reset.'
      })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

const dataSchema = Joi.object({
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().min(8).required()
})

export const updatePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params
    const validatedFormData = await dataSchema.validateAsync({ ...req.body })
    const { password, confirmPassword } = validatedFormData

    if (password !== confirmPassword) {
      res.json({ error: 'Passwords do not match' })
    }

    // Finding the user by ID
    const user =
      (await Customer.findByPk(id)) ??
      (await Restaurant.findByPk(id)) ??
      (await Admin.findByPk(id))

    if (!user) {
      throw new Error('User not found')
    }

    // Hashing the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Updating the password with the hashed password
    user.password = hashedPassword

    // Saving the updated user
    await user.save()

    res.json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating password:', error.message)
    res.json({ success: false, message: 'Error updating password' })
  }
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.USERS,
    pass: process.env.PASSWORD
  }
})

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body
  const user = await Customer.findOne({ where: { email } })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  const token = crypto.randomBytes(20).toString('hex')
  user.resetPasswordToken = token
  user.resetPasswordExpiration = new Date(Date.now() + 3600000) // 1 hour
  await user.save()

  const mailOptions = {
    from: process.env.USERS,
    to: email,
    subject: 'Password Reset',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\nhttp://${req.headers.host}/customerchangepassword/${token}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`
  }

  await transporter.sendMail(mailOptions)

  res.status(200).json({ message: 'An email has been sent to the address provided with further instructions.' })
}

export const resetPasswordToken = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params
  const { password } = req.body

  const user = await Customer.findOne({ where: { resetPasswordToken: token } })

  if (!user) {
    res
      .status(404)
      .json({ error: 'Password reset token is invalid or has expired.' })
    return
  }

  if (!user.resetPasswordExpiration || Date.now() > user.resetPasswordExpiration.getTime()) {
    res
      .status(401)
      .json({ error: 'Password reset token is invalid or has expired.' })
    return
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  user.password = hashedPassword

  user.resetPasswordToken = null
  user.resetPasswordExpiration = null
  await user.save()

  res.status(200).json({ message: 'Your password has been reset!' })
}
