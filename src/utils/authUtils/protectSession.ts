import jwt from 'jsonwebtoken';

interface payloadProp extends jwt.JwtPayload {
    id?: string;
    email?: string;
    role?: string;
};

export default function protectSession(token: string): { payload: payloadProp, validSession: boolean, error: unknown | null } {
    try {
        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET_KEY || 'secret-key');

        return { payload: verifiedToken as jwt.JwtPayload , validSession: true, error: null };
    } catch (err) {
        return { payload: {}, validSession: false, error: err } 
    }

}