import express, {
  type Request,
  type Response,
  type NextFunction
} from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import session from 'express-session'
import passport from 'passport'
import indexRouter from './routes/index'
import menuRouter from './routes/menu'
import restaurantRouter from './routes/restaurant'
import orderRouter from './routes/addOrder'
import isLoggedIn from './middleware/loggin'
import './config/auth'
import sequelize from './config/database.config'
import Admin from './models/Admin'
import customerRouter from './routes/customer'
import cors from 'cors'
import { config } from 'dotenv'
import protectedRouter from './routes/verifyTokenRoute'

config()

const app = express()

sequelize
  .sync({ force: false })
  .then(() => {
    console.log('Database connected')
  })
  .catch((err) => {
    console.log('Error connecting to database', err)
  })
void Admin.sync()

// Middleware
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../', 'public')))
app.use(cors({ credentials: true, origin: 'http://localhost:5173' })) // Enable CORS for all routes - Integration with frontend

// Session middleware
app.use(
  session({
    secret: process.env.SECRET ?? 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use('/', indexRouter)
app.use('/order', orderRouter)
app.use('/restaurant', restaurantRouter)
app.use('/customer', customerRouter)
app.use('/menu', menuRouter)
app.use('/protected-routes', protectedRouter)

// Auth routes
app.get('/auth/google',
  passport.authenticate('google', {
    scope:
     ['email', 'profile'],
    prompt: 'consent'
  }
  ))

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/auth/protected',
    failureRedirect: '/auth/google/failure'
  })
)

// app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }))

app.get(
  '/auth/google/failure',
  (req: Request, res: Response, next: NextFunction) => {
    res.send('Something went wrong!')
  }
)

app.get(
  '/auth/protected',
  isLoggedIn,
  (req: Request, res: Response, next: NextFunction) => {
    res.redirect('http://localhost:5173/customerdashboard')
  }
)

export default app
