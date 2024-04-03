import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.config'
import { v4 as uuidv4 } from 'uuid'
import Restaurant from './Restaurant'
class Order extends Model {
  public id!: string
  public orderNumber!: number
  public orderStatus!: string
  public orderDate!: string
  public totalAmount!: number
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
      unique: true
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    orderStatus: {
      type: DataTypes.STRING,
      allowNull: false
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Customer',
        key: 'id'
      }
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Restaurant',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'Order'
  }
)
Order.belongsTo(Restaurant, { foreignKey: 'restaurantId' })
export default Order
