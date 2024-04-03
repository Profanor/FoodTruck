// import type { Request, Response } from 'express'
// import Order from '../models/Order'

// export const addOrder = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { orderNumber, orderStatus, orderItem, customerId, restaurantId } = req.body
//     // Calculate totalAmount based on orderItem prices
//     const totalAmount = calculateTotalAmount(orderItem)

//     const newOrder = await Order.create({
//       orderNumber,
//       orderStatus,
//       orderItem,
//       totalAmount,
//       customerId,
//       restaurantId
//     })

//     res.status(201).json(newOrder)
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ error: 'Internal Server Error' })
//   }
// }
// // Function to calculate total amount from order items
// const calculateTotalAmount = (orderItems: Array<{ itemName: string, price: number }>): number => {
//   if (!orderItems || orderItems.length === 0) {
//     return 0; // Return 0 if orderItems is undefined or empty
//   }
//   return orderItems.reduce((total, item) => total + item.price, 0);
// }

import type { Request, Response } from 'express'
import Order from '../models/Order'

export const addOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderNumber, orderStatus, orderItem, customerId, restaurantId } = req.body
    // Calculate totalAmount based on orderItem prices
    const totalAmount = calculateTotalAmount(orderItem)

    const newOrder = await Order.create({
      orderNumber,
      orderStatus,
      orderItem,
      totalAmount,
      customerId,
      restaurantId
    })

    res.status(201).json(newOrder)
  } catch (error: any) {
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map((error: any) => ({
        message: error.message,
        field: error.path
      }))
      res.status(400).json({ errors: validationErrors })
    } else {
      console.error(error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
}

// Function to calculate total amount from order items
const calculateTotalAmount = (orderItems: Array<{ itemName: string, price: number }>): number => {
  if (!orderItems || orderItems.length === 0) {
    return 0; // Return 0 if orderItems is undefined or empty
  }
  return orderItems.reduce((total, item) => total + item.price, 0);
}
