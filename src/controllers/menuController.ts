import { type Request, type Response } from 'express'
import Menu from '../models/Menu'

export const getAllMenus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const menus = await Menu.findAll()
    res.json(menus)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

export const getMenuById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params
  try {
    const menu = await Menu.findByPk(id)
    if (menu) {
      res.json(menu)
    } else {
      res.status(404).json({ error: 'Menu not found' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
