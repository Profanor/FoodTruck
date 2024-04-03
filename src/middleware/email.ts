import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'infos.Foodtruck@gmail.com',
    pass: process.env.PASSWORD
  }
})

const mailData = {
  from: 'infos.foodtruck@gmail.com',
  to: [
    'olalekanwaliyullahi99@gmail.com',
    'joy.gold13@gmail.com',
    'nathanaelodion@gmail.com'
  ],
  subject: 'Welcome to Foodtruck! Account signed up sucessfully',
  text: 'Your account is set up ',
  html: '<b>Hello Foodtruck devs</b>'
}

transporter.sendMail(mailData, function (err, info) {
  if (err) {
    console.log(err)
  } else {
    console.log('Mails sent successfully')
  }
})
