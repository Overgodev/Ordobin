import * as crypto from 'crypto';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export interface SimpleTokenPayload {
  userId: string;
  email: string;
  username: string;
  exp: number;
}

export function generateToken(payload: Omit<SimpleTokenPayload, 'exp'>): string {
  const tokenPayload: SimpleTokenPayload = {
    ...payload,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  const tokenString = JSON.stringify(tokenPayload);
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(tokenString)
    .digest('hex');
  
  return Buffer.from(tokenString + '.' + signature).toString('base64');
}

export function verifyToken(token: string): SimpleTokenPayload | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [tokenString, signature] = decoded.split('.');
    
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(tokenString)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    const payload: SimpleTokenPayload = JSON.parse(tokenString);
    
    if (Date.now() > payload.exp) {
      return null; // Token expired
    }
    
    return payload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  // Using Node.js built-in crypto
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return salt + ':' + hash;
}

export async function comparePassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  const testHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return hash === testHash;
}