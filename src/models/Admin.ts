import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.config'
import { v4 as uuidv4 } from 'uuid'
import Restaurant from './Restaurant'

class Admin extends Model {
  public id!: string
  public firstName!: string
  public lastName!: string
  public email!: string
  public phoneNumber!: number
  public password!: string
  public role!: string
}

// Custom validation function for role

Admin.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      unique: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phoneNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'admin'
    }
  },
  {
    sequelize,
    modelName: 'Admin'
  }
)

Admin.hasMany(Restaurant, { foreignKey: 'adminId' })

export default Admin
