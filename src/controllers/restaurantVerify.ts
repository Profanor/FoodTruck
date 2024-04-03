import { type Request, type Response } from 'express'

import speakeasy from 'speakeasy'
import Restaurant from '../models/Restaurant'
import { transporter } from '../utils/emailSender'

export const sendResOTP = async (email: string): Promise<unknown> => {
  try {
    const restaurant = await Restaurant.findOne({ where: { email } })
    if (!restaurant) {
      return 'invalid email'
    } else {
      const totpSecret = speakeasy.generateSecret({ length: 20 })
      const totpToken = speakeasy.totp({
        secret: totpSecret.base32,
        encoding: 'base32'
      })
      console.log(totpToken)

      // Store the OTP in the user record
      restaurant.otp = totpToken
      restaurant.otpExpirationTime = new Date(Date.now() + 10 * 90 * 1000) // 10 mins from now
      await restaurant.save()
      const mailOptions = {
        from: 'infos.foodtruck@gmail.com',
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP is: ${totpToken}`,
        html: `<b>Your OTP is: ${totpToken}</b>`
      }
      await transporter.sendMail(mailOptions)
    }
    // res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error)
  }
}

export const verifyOTPEmailAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { otp } = req.body

    const restaurant = await Restaurant.findOne({ where: { otp } })

    if (!restaurant) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    if (restaurant.otp !== otp || Date.now() > restaurant.otpExpirationTime.getTime()) {
      res.status(400).json({ error: 'Invalid or expired OTP' })
      return
    }

    // Clear the OTP from the user record
    if (restaurant.otp !== null && restaurant.otpExpirationTime !== null) {
      await restaurant.save()
    }
    // Set isVerified to true
    await Restaurant.update({ isVerified: true }, { where: { otp } })

    res.status(200).json({ message: 'OTP verified successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
