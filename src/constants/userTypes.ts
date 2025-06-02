export interface userData {
    name: string;
    email: string;
    password: string;
}

export interface loginData {
    name: string;
    email: string;
    password: string;
}

export interface jwtPayloadProp {
    id: string;
    email: string;
    role: string;
}

export interface userDataUpdate {
    name?: string;
    email?: string;
    password?: string;
}