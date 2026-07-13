import dbConnect from './db';
import User from '../models/User'; // Create a simple Mongoose model with 'username' and 'level'

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { userId, currentLevel, coins } = req.body;
    try {
      const user = await User.findByIdAndUpdate(userId, { 
        currentLevel, 
        coins 
      }, { new: true, upsert: true });
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false });
    }
  }
}
