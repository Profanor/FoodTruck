import { type Request, type Response } from 'express'
import Restaurant from '../models/Restaurant'
// import speakeasy from 'speakeasy'
import nodemailer from 'nodemailer'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'infos.foodtruck@gmail.com',
    pass: 'iaqf ymli oufk xxbb'
  }
})

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body
  const user = await Restaurant.findOne({ where: { email } })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  const token = crypto.randomBytes(20).toString('hex')
  user.resetPasswordToken = token
  user.resetPasswordExpiration = new Date(Date.now() + 3600000) // 1 hour
  await user.save()

  const mailOptions = {
    from: 'infos.foodtruck@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\nhttp://${req.headers.host?.replace(/:\d+/, ':5173')}/adminchangepassword/${token}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`
  }

  await transporter.sendMail(mailOptions)

  res.status(200).json({ message: 'An email has been sent to the address provided with further instructions.' })
}

export const resetPasswordToken = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params
  const { password } = req.body

  const user = await Restaurant.findOne({ where: { resetPasswordToken: token } })

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
