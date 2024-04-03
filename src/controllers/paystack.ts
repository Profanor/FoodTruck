import { Request, Response } from 'express';
import * as https from 'https';
import { config } from 'dotenv';

config();

const payStack = {
  acceptPayment: async (req: Request, res: Response) => {
    try {
      const { email, amount } = req.body;

      const params = JSON.stringify({
        email,
        amount: amount * 100, // Convert amount to kobo (100 kobo = 1 naira)
      });

      const options: https.RequestOptions = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/initialize',
        method: 'POST',
        headers: {
          Authorization: process.env.SECRET_KEY,
          'Content-Type': 'application/json'
        }
      };

      const apiResponse = await new Promise<string>((resolve, reject) => {
        const clientReq = https.request(options, (apiRes) => {
          let data = '';
  
          apiRes.on('data', (chunk: string) => {
            data += chunk;
          });
  
          apiRes.on('end', () => {
            resolve(data);
          });
        }).on('error', (error) => {
          reject(error);
        });
  
        clientReq.write(params);
        clientReq.end();
      });

      const jsonData = JSON.parse(apiResponse);
      return res.status(200).json(jsonData);
    } catch (error) {
      console.error('Error processing payment:', error);
      return res.status(500).json({ error: 'An error occurred' });
    }
  }
};

export = payStack;