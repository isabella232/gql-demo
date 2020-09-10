const AUTHORIZATION = {
    JWT_KEY: process.env.JWT_KEY || 'developmentkey',
    JWT_TOKEN_EXPIRY: '1h', // expires in one hour.
    SKIP_AUTHORIZATION: process.env.SKIP_AUTHORIZATION === '1',
};

export const authConfig = AUTHORIZATION;
