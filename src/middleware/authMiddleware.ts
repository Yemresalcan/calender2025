import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token bulunamadı' });
  }

  if (!authService.verifyToken(token)) {
    return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
  }

  next();
}; 