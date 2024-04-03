import express from 'express'
import { getAllMenus, getMenuById } from '../controllers/menuController'

const routes = express.Router()

// eslint-disable-next-line @typescript-eslint/no-misused-promises
routes.get('/', getAllMenus)
// eslint-disable-next-line @typescript-eslint/no-misused-promises
routes.get('/:id', getMenuById)

export default routes
