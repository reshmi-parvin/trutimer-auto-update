
export interface Login {
    result: {
        userDetails: user;
        settings: [];
        authenticateResult: auth;
    };
    success;
}

// tslint:disable-next-line: class-name
// eslint-disable-next-line @typescript-eslint/naming-convention
interface user {
    email: string;
    phoneNumber: any;
    tenantId: number;
    isActive: boolean;
    userName: string;
    name: string;
    surName: string;
    id: number;
}

// tslint:disable-next-line: class-name
// eslint-disable-next-line @typescript-eslint/naming-convention
interface auth {
    accessToken: string;
    encryptedAccessToken: string;
    expireInSeconds: number;
    userId: number;
}
