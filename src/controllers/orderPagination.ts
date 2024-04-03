// Import necessary modules and dependencies
import { Request, Response } from 'express';
import Order from '../models/Order';

// Endpoint to confirm an order
export const confirmOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params; // Get orderId from request parameters

    const order = await Order.findByPk(orderId);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    order.orderStatus = 'resolved'; // Update order status to "resolved"
    await order.save();

    res.status(200).json({ message: 'Order confirmed successfully' });
  } catch (error) {
    console.error('Error confirming order', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Endpoint to fetch orders based on type and pagination
export const getOrdersByType = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const type = req.query.type ? req.query.type : 'all';

    const offset = (page - 1) * limit;

    const whereClause: Record<string, 'resolved' | 'unresolved' | undefined> = {};

    switch (type) {
      case 'resolved':
        whereClause.orderStatus = 'resolved';
        break;
      case 'unresolved':
        whereClause.orderStatus = 'unresolved';
        break;
      default:
        // No need to specify a where clause if type is 'all'
        break;
    }

    const orders = await Order.findAll({ where: whereClause, offset, limit });
    const totalOrder = await Order.count({ where: whereClause });

    res.status(200).json({
      message: 'Orders Successfully retrieved',
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrder / limit),
    });
  } catch (error) {
    console.error('Error getting orders', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// import { Request, Response, NextFunction } from 'express';
// import Order from '../models/Order';

// export const getOrdersByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 5;
//     const type = req.query.type ? req.query.type : 'all';

//     const offset = (page - 1) * limit;

//     const whereClause: Record<string, 'resolved' | 'unresolved' | undefined> = {};

//     switch (type) {
//       case 'resolved':
//         whereClause.orderStatus = 'resolved';
//         break;
//       case 'unresolved':
//         whereClause.orderStatus = 'unresolved';
//         break;
//       default:
//         delete whereClause.orderStatus;
//     }

//     const orders = await Order.findAll({ where: whereClause, offset, limit });
//     const totalOrder = await Order.count({ where: whereClause });

//     res.status(200).json({
//       message: 'Orders Successfully retrieved',
//       orders,
//       currentPage: page,
//       totalPages: Math.ceil(totalOrder / limit),
//     });
//   } catch (error) {
//     console.error('Error getting orders', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

// export const confirmOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const { orderId } = req.params;

//     const order = await Order.findByPk(orderId);

//     if (!order) {
//       res.status(404).json({ message: 'Order not found' });
//       return;
//     }

//     order.orderStatus = 'resolved'; // Update order status to "resolved"
//     await order.save();

//     res.status(200).json({ message: 'Order confirmed successfully' });
//   } catch (error) {
//     console.error('Error confirming order', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };
