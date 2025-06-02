import jwt from 'jsonwebtoken';
import { sha256 } from 'js-sha256';
import myCache from '../../libs/cache';

interface payloadProp extends jwt.JwtPayload {
    id?: string;
    email?: string;
    role?: string;
};

export default function protectSession(token: string): { payload: payloadProp, validSession: boolean } {
    try {
        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET_KEY || 'secret-key');
        const email = (verifiedToken as jwt.JwtPayload).email;
        const isCached = myCache.has(`jwt:${sha256(email)}`);
        if (!isCached) {
            return { payload: {}, validSession: false };
        }

        return { payload: verifiedToken as jwt.JwtPayload , validSession: true };
    } catch {
        return { payload: {}, validSession: false } 
    }

}