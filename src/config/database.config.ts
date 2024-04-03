import { Sequelize } from 'sequelize'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  host: 'host',  
  storage: './database.sqlite3',
  logging: false
})

export default sequelize
