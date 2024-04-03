import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.config'
import { v4 as uuidv4 } from 'uuid'

class Delivery extends Model {
  public id!: string
  public name!: string
  public email!: string
  public address!: string
  public phoneNumber!: string
  public city!: string
  public state!: string
}

Delivery.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deliveryStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Null'
    }
  },
  {
    sequelize,
    modelName: 'Delivery'
  }
)

export default Delivery
