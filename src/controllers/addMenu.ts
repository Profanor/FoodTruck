// import Menu from '../models/Menu'
// import { type Request, type Response } from 'express'

// export const addMenu = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { nameofDish, category, priceofDish, description, imageofDish, restaurantId } = req.body

//     // Assuming your authorization middleware sends the entire restaurant object in the JSON response

//     const data = await Menu.create({ 
//       nameofDish, 
//       category, 
//       priceofDish, 
//       description, 
//       imageofDish: req.file?.buffer,
//       restaurantId // Assuming 'id' is the field containing the restaurant ID
//     })

//     if (data) {
//       res.status(200).json({
//         message: 'Menu added successfully!'
//       })
//     }
//   } catch (error) {
//     console.error('Error adding Menu', error)
//     res.status(500).json({
//       message: 'Internal server error'
//     })
//   }
// }

import Menu from '../models/Menu';
import { Request, Response } from 'express';

export const addMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nameofDish, category, priceofDish, description, imageofDish, restaurantId } = req.body;

    // Use the uploaded image in some way, such as storing it in the database
    const imageData = req.file?.buffer; // Assuming imageofDish is stored as a buffer

    // Create a new menu item with the uploaded image data
    const data = await Menu.create({ 
      nameofDish, 
      category, 
      priceofDish, 
      description, 
      imageofDish: imageData, // Use the uploaded image data
      restaurantId
    });

    if (data) {
      res.status(200).json({
        message: 'Menu added successfully!'
      });
    }
  } catch (error) {
    console.error('Error adding Menu', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};
