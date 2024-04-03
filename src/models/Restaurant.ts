import { DataTypes, Model } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelize from '../config/database.config'
import Menu from './Menu'
import Delivery from './Delivery'

class Restaurant extends Model {
  public id!: string
  public nameofRestaurant!: string
  public state!: string
  public logo!: Buffer
  public otp!: string
  public otpExpirationTime!: Date
  public email!: string
  public isVerified!: boolean
  public password!: string
  public phoneNumber!: number
  public address!: string
  public resetPasswordExpiration!: Date | null
  public resetPasswordToken!: string | null
  Menus: any
}

Restaurant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      unique: true
    },
    nameofRestaurant: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    logo: {
      type: DataTypes.BLOB,
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
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true
    },
    address: {
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
    modelName: 'Restaurant'
  }
)

// Restaurant.associate()
// Restaurant.hasMany(Menu, { foreignKey: 'restaurantId' })
Restaurant.hasMany(Delivery, { foreignKey: 'restaurantId' })

export default Restaurant
