/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import {
  getAllMenu,
  getAllMenuImages,
  getRestaurantLogos,
  restaurantLogin,
  restaurantSignup,
  updateOrder, getEachMenu, logout
} from '../controllers/restaurantController'
import { addMenu } from '../controllers/addMenu'
import { getOrdersByType } from '../controllers/orderPagination'
import multer from 'multer'
import { verifyOTPEmailAuth } from '../controllers/restaurantVerify'

import { resetPassword, resetPasswordToken } from '../controllers/restaurantPassword'

// import { verifyOTPEmailAuth } from '../controllers/emailverify'

const storage = multer.memoryStorage() // Store images in memory (Buffer)
const upload = multer({ storage: storage })

const router = express.Router()
router.post('/signup', upload.single('logo'), restaurantSignup)
router.get('/menu/:id', getEachMenu)
router.post('/login', restaurantLogin)
router.put('/orders/:orderId', updateOrder)
router.get('/menus/', getAllMenu)
router.get('/menusImages/', getAllMenuImages)

//  endpoint add menu to resturants
router.post('/addMenu', upload.single('imageofDish'), addMenu)

// pagination to get several orders of many category.
router.get('/getorder', getOrdersByType)

router.post('/otp-verifyEmail', verifyOTPEmailAuth)

router.post('/reset-password', resetPassword)

router.post('/reset-password/:token', resetPasswordToken)

router.get('/getAllLogos', getRestaurantLogos)

router.get('/logout', logout);

export default router
