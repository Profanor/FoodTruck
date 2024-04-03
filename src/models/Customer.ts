import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.config'
import { v4 as uuidv4 } from 'uuid'
import Order from './Order'
import Restaurant from './Restaurant'
import Delivery from './Delivery'

class Customer extends Model {
  public id!: string
  public FirstName!: string
  public LastName!: string
  public otp!: string
  public otpExpirationTime!: Date
  public email!: string
  public isVerified!: boolean
  public password!: string
  public phoneNumber!: number
  public resetPasswordExpiration!: Date | null
  public resetPasswordToken!: string | null
}

Customer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      unique: true
    },
    FirstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    LastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    otpExpirationTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpiration: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Customer'
  }
)

Customer.hasMany(Order, { foreignKey: 'customerId' })
Customer.belongsToMany(Restaurant, { through: 'customerFavoriteRestaurant' })
Customer.hasMany(Delivery, { foreignKey: 'customerId' })

export default Customer
