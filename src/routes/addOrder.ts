/* eslint-disable @typescript-eslint/no-misused-promises */
// src/routes/orderRoutes.ts
import express from 'express'
import { addOrder } from '../controllers/addOrder.controller'

const router = express.Router()

router.post('/orders', addOrder)

export default router
