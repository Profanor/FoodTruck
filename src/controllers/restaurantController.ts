import Restaurant from '../models/Restaurant'
import Order from '../models/Order'
import { type Request, type Response, type NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import Menu from '../models/Menu'
import { sendResOTP } from './restaurantVerify'
import jwt from 'jsonwebtoken'
// import sizeOf from 'image-size';
// import { execSync } from 'child_process'

const secret = 'Foodtruck'

const validateInputs = (email: string, password: string): string | null => {
  if (!email || !password) {
    return 'Email and password are required fields'
  }
  return null // Inputs are valid
}
export const restaurantSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      nameofRestaurant,
      email,
      state,
      logo,
      phoneNumber,
      address,
      password
    } = req.body

    // Validate inputs
    const validationError = validateInputs(email, password)
    if (validationError) {
      res.status(400).json({ message: validationError })
      return
    }

    // Check if the restaurant with the given email already exists
    const existingRestaurant = await Restaurant.findOne({ where: { email } })

    if (existingRestaurant) {
      res.json({
        status: 'failed',
        message: 'Email is already in use, try another email'
      })
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create a new restaurant with the logo field
    const newRestaurant = await Restaurant.create({
      nameofRestaurant,
      state,
      email,
      password: hashedPassword,
      phoneNumber,
      address,
      logo: req.file?.buffer
    })

    await sendResOTP(email)

    if (!newRestaurant) {
      res.status(400).json({
        status: 'failed',
        message: 'Invalid details, account cannot be created'
      })
      return
    }

    res.status(201).json({
      restaurantDetail: newRestaurant,
      message: 'Signup successful'
    })
  } catch (error) {
    console.error('Error during Restaurant signup:', error)
    res.status(500).json({ message: 'Restaurant signup unsuccessful' })
  }
}

export const restaurantLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body
    const existingRestaurant = await Restaurant.findOne({ where: { email } })

    if (!existingRestaurant) {
      console.log('Restaurant not found')
      res.json({
        restaurantNotFoundError: 'Restaurant not found'
      })
    } else {
      const isPasswordValid = await bcrypt.compare(password, existingRestaurant.dataValues.password)

      if (!isPasswordValid) {
        console.log('Invalid password')
        res.json({
          inValidPassword: 'Invalid password'
        })
      } else {
        try {
          const restaurantToken = jwt.sign({ loginkey: existingRestaurant.dataValues.id }, secret, { expiresIn: '1h' })

          console.log('token', restaurantToken)

          if (!restaurantToken) {
            console.log('Token creation failed')
            res.json({
              tokenCreationError: 'Token creation failed'
            })
          } else {
            res.cookie('token', restaurantToken, { httpOnly: true, secure: false })
            res.json({
              restaurant: 'Login successful'
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

export const updateOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const orderId = req.params.orderId
    console.log('orderId', orderId)

    // Assuming you have a request body containing fields to update
    const { orderStatus, orderDate, totalAmount } = req.body

    const [updatedRowsCount, updatedOrder] = await Order.update(
      { orderStatus, orderDate, totalAmount },
      {
        returning: true,
        where: { id: orderId }
      }
    )

    if (updatedRowsCount === 0 || !updatedOrder) {
      res.status(404).json({ error: 'Order not found' })
      return
    }

    // Send the updated order as a response
    res.json(updatedOrder)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

// get paginated menus for restaurant
// export const getAllMenu = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const menus = await Menu.findAll();

//     if (!menus || menus.length === 0) {
//       res.status(404).json({
//         message: 'Menu not found'
//       });
//     } else {
//       res.json({
//         menus
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// Backend route to get all menus
export const getAllMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    // Find the latest menu items added by each restaurant
    const latestMenus = await Menu.findAll({
      attributes: ['nameofDish', 'description', 'priceofDish', 'id'], // Select the necessary attributes
      group: ['restaurantId'], // Group by restaurantId to get the latest menu for each restaurant
      order: [['createdAt', 'DESC']], // Order by createdAt to get the latest menu items
      limit: 6 // Limit the result to 6 menu items
    });

    if (!latestMenus || latestMenus.length === 0) {
      res.status(404).json({
        message: 'Latest menus not found'
      });
      return;
    }
console.log('menu', latestMenus)
    res.status(200).json({
      latestMenus
    });
  } catch (error) {
    console.error('Error retrieving latest menus:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Backend route to get all menus
export const getEachMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const {id } = req.params
    // Find the latest menu items added by each restaurant
    const latestMenus = await Menu.findOne({
      attributes: ['nameofDish', 'description', 'priceofDish', 'id'],
      where: { id }
      });
      console.log('latest', latestMenus)
      res.json({latestMenus})

  } catch (error) {
    console.error('Error retrieving latest menus:', error);
    res.json({ error: 'Internal Server Error' });
  }
};

// Backend route to get all menu images
export const getAllMenuImages = async (req: Request, res: Response): Promise<void> => {
  try {
    // Find the latest menu items added by each restaurant
    const latestMenus = await Menu.findAll({
      attributes: ['imageofDish'], // Select the image attribute
      group: ['restaurantId'], // Group by restaurantId to get the latest menu for each restaurant
      order: [['createdAt', 'DESC']], // Order by createdAt to get the latest menu items
      limit: 6 // Limit the result to 6 menu items
    });

    // Extract image data from each menu item
    const imageDataArray = latestMenus.map((menu: any) => menu.imageofDish?.toString('base64') ?? null);

    res.status(200).json({
      imageDataArray
    });
  } catch (error) {
    console.error('Error retrieving latest menu images:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const getRestaurantLogos = async (req: Request, res: Response): Promise<void> => {
  try {
    const logos = await Restaurant.findAll({
      attributes: ['logo'] // Select only the logo attribute
    });

    // Extract logo data from each restaurant
    const logoBase64Array = logos.map((restaurant: any) => restaurant.logo?.toString('base64') ?? null);

    res.status(200).json(logoBase64Array);
  } catch (error) {
    console.error('Error retrieving restaurant logos:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export async function logout(req: Request, res: Response) {
  console.log('Logout route called');
  res.clearCookie('token'); // Clear the authentication token cookie
  res.redirect('/');
}