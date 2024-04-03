import { DataTypes, Model } from 'sequelize'
// import { ModelStatic } from 'sequelize'
import sequelize from '../config/database.config'
import { v4 as uuidv4 } from 'uuid'
import Restaurant from './Restaurant'

class Menu extends Model {
  public id!: string
  public nameofDish!: string
  public category!: string
  public priceofDish!: string
  public description!: string
  public imageofDish!: Buffer

  static associate (): void {
    Menu.belongsTo(Restaurant, { foreignKey: 'restaurantId' })
    // Restaurant.hasMany(Menu, { foreignKey: 'restaurantId' });
  }

  // static associate(models: { Restaurant: ModelStatic<Model> }): void {
  //   Menu.belongsTo(models.Restaurant, { foreignKey: 'restaurantId' });
  // }
}

Menu.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
      unique: true
    },
    nameofDish: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    priceofDish: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    imageofDish: {
      type: DataTypes.BLOB,
      allowNull: false
    },
    restaurantId: { // This is your foreign key
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: 'Menu'
  }
)

export default Menu
