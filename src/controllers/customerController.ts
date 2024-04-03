import { type Request, type Response, type NextFunction } from 'express'
import Customer from '../models/Customer' // Import your models from the correct path
import Order from '../models/Order'
import Restaurant from '../models/Restaurant'
import { Op } from 'sequelize'
import bcrypt from 'bcryptjs'
import Delivery from '../models/Delivery'
import jwt from 'jsonwebtoken'

import { sendOTP } from './emailverify'

const secret = 'Foodtruck'

export const customerSignup = async (req: Request, res: Response): Promise<void> => {
  const { id, FirstName, LastName, email, password, phoneNumber } = req.body

  // Validate inputs

  try {
    const existingCustomer = await Customer.findOne({ where: { email } })

    if (existingCustomer) {
      res.status(400).json({
        status: 'failed',
        existingCustomermessage: 'Email is already in use, try another email'
      })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const newCustomer = await Customer.create({
      id,
      FirstName,
      LastName,
      email,
      phoneNumber,
      password: hashedPassword
    })

    // Send OTP to the newly registered user
    await sendOTP(email)

    // Verify the OTP

    if (!newCustomer) {
      res.status(400).json({
        status: 'failed',
        message: 'Invalid details, account cannot be created'
      })
      return
    }

    res.status(200).json({
      status: 'success',
      message: 'Signup successful',
      customerDetail: { id, FirstName, LastName, email, phoneNumber }
    })
  } catch (error) {
    console.error('Error during customer signup:', error)
    res.status(500).json({
      status: 'error',
      Errormessage: 'Internal server error'
    })
  }
}

export const customerLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body
    const existingCustomer = await Customer.findOne({ where: { email } })

    if (!existingCustomer) {
      console.log('Customer not found')
      res.json({
        customerNotFoundError: 'Customer not found'
      })
    } else {
      const isPasswordValid = await bcrypt.compare(password, existingCustomer.dataValues.password)

      if (!isPasswordValid) {
        console.log('Invalid password')
        res.json({
          inValidPassword: 'Invalid password'
        })
      } else {
        try {
          const customerToken = jwt.sign({ loginkey: existingCustomer.dataValues.id }, secret, { expiresIn: '1h' })

          console.log('token', customerToken)

          if (!customerToken) {
            console.log('Token creation failed')
            res.json({
              tokenCreationError: 'Token creation failed'
            })
          } else {
            res.cookie('token', customerToken, { httpOnly: true, secure: false })
            res.json({
              customer: 'Login successful'
            })
          }
        } catch (tokenError) {
          console.error('Error creating token:', tokenError)
          res.json({
            tokenCreationError: 'Error creating token'
          })
        }
      }
    }
  } catch (error: any) {
    console.error(error)
    res.json({
      internalServerError: `Error: ${error}`
    })
  }
}

interface FormattedOrder {
  id: string
  orderNumber: number
  orderStatus: string
  orderDate: string
  totalAmount: number
  restaurant: {
    id: string
    nameofRestaurant: string
    // other attributes of Restaurant that you want to expose
  } | null
}

interface FormattedCart {
  id: string
  firstName: string
  lastName: string
  email: string
  isVerified: boolean
  phoneNumber: number
  orders: FormattedOrder[]
}

const formatDate = (date: Date | string): string => {
  const dateObject = date instanceof Date ? date : new Date(date)

  return dateObject.toLocaleDateString()
}

const formatOrder = (order: Order): FormattedOrder => {
  const restaurantInstance = order.get('Restaurant') as Restaurant | null

  return {
    id: order.get('id'),
    orderNumber: order.get('orderNumber'),
    orderStatus: order.get('orderStatus'),
    orderDate: formatDate(order.get('orderDate')),
    totalAmount: order.get('totalAmount'),
    restaurant: restaurantInstance ? {
      id: restaurantInstance.get('id'),
      nameofRestaurant: restaurantInstance.get('nameofRestaurant')
      // Add other attributes of Restaurant as needed
    } : null
  }
}

const formatCart = (customer: Customer): FormattedCart => {
  const orders: Order[] | null = customer.get('Orders') as Order[] | null

  const formattedCart: FormattedCart = {
    id: customer.get('id'),
    firstName: customer.get('FirstName'),
    lastName: customer.get('LastName'),
    email: customer.get('email'),
    isVerified: customer.get('isVerified'),
    phoneNumber: customer.get('phoneNumber'),
    orders: orders
      ? orders.map(formatOrder)
      : ([] as FormattedOrder[])
  }

  return formattedCart
}

// endpoint to get user's cart details
export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const customer = await Customer.findOne({
      where: { id },
      include: [
        {
          model: Order,
          where: {
            orderStatus: {
              [Op.in]: ['pending', 'in-progress']
            }
          },
          required: false,
          include: [{ model: Restaurant }]
        }
      ]
    })

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' })
      return
    }

    const formattedCart: FormattedCart = formatCart(customer)

    res.json({ cart: formattedCart })
  } catch (error) {
    console.error('Error while getting cart details:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// endpoint with details for checkout
export const getCheckoutDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const customer = await Customer.findOne({
      where: { id },
      include: [
        {
          model: Order,
          where: {
            orderStatus: {
              [Op.in]: ['pending', 'in-progress']
            }
          },
          required: false,
          include: [{ model: Restaurant }]
        }
      ]
    })

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' })
      return
    }

    const formattedCart: FormattedCart = formatCart(customer)

    res.json({ cart: formattedCart })
  } catch (error) {
    console.error('Error while getting cart details:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
// get paginated endpoint for user's order history
export const customerOrderHistory = async (req: Request, res: Response): Promise<void> => {
  const { customerId } = req.params
  const { page = 1, pageSize = 10 } = req.query

  try {
    const orders = await Order.findAndCountAll({
      where: { customerId },
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['orderDate', 'DESC']] // Order by date in descending order
    })

    if (orders.count === 0) {
      res.json({ message: 'No orders found' })
    } else {
      res.json({
        total: orders.count,
        totalPages: Math.ceil(orders.count / Number(pageSize)),
        currentPage: Number(page),
        orders: orders.rows
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

// endpoint to add Customer Delivery details
export const addDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phoneNumber, address, city, state, deliveryStatus } = req.body

    // Fetch customer details based on customerId
    const customerEmail = await Customer.findOne({ where: { email } })

    if (!customerEmail) {
      console.log('Invalid Email')
      res.json({ success: false, error: 'Invalid Email' })
      return
    }

    // Create a new delivery record
    await Delivery.create({
      name,
      email,
      phoneNumber,
      city,
      state,
      address,
      deliveryStatus
    })

    // // Combine delivery details with customer details
    // const combinedDetails = {
    //   ...newDelivery.toJSON(),
    //   customer: customerDetails.toJSON()
    // }

    // Send a success response with combined details
    res.json({ success: true, message: 'Delivery details saved' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: 'Internal Server Error' })
  }
}

//     const { name, emailAddress, address, phoneNumber, city, state } = req.body

//     const data = await Delivery.create({ name, emailAddress, address, phoneNumber, city, state })
//     if (data) {
//       res.status(200).json({
//         message: 'Delivery details added Sucessfully!'
//       })
//     }
//   } catch (error) {
//     error
//     console.error('error adding Delivery details', error)
//     if (error) {
//       res.status(500).json({
//         message: 'Internal server error', error
//       })
//     }
//   }

export async function logout(req: Request, res: Response) {
  res.clearCookie('token'); 
  res.json({ successMessage: 'Logged out successfully' });
}