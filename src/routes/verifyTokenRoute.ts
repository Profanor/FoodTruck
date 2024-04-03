import express from 'express'
import { checkAndVerifyCustomerToken, checkAndVerifyRestaurantToken } from '../middleware/Authorization'
const router = express.Router()

router.get('/customer', checkAndVerifyCustomerToken)

router.get('/restaurant', checkAndVerifyRestaurantToken)

export default router
