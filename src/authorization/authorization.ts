import { ApolloError, ForbiddenError } from 'apollo-server';
import * as jwt from 'jsonwebtoken';
import { authConfig } from '../configs';
import { ErrorCodes } from '../errors/errorCodes'

const UserTypes = {
    Anonymous: 'Anonymous',
    User: 'User',
};

const DefaultAuthorizationOptions = {
    jwtKey: authConfig.JWT_KEY,
    jwt,
    signingOptions: 
    {
        algorithm: 'HS256',
        expiresIn: authConfig.JWT_TOKEN_EXPIRY,
        audience: 'User',
        subject: '', // TODO: need to overload on creation with userIdentifier
    },
}


const createAuthorization = (authorizationOptions, payload, ) => {
    return authorizationOptions.jwt.sign(
        payload,
        authorizationOptions.jwtKey,
        authorizationOptions.signingOptions
    )
}

const getAuthorization = (authorizationOptions, bearerValue) => {
    try {
        return authorizationOptions.jwt.verify(bearerValue, authorizationOptions.jwtKey);
    } catch (e) {
        console.error(`generateContext:${bearerValue}`);
        if (e.name === 'TokenExpiredError') {
            throw new ApolloError('Token Expired', ErrorCodes.ExpiredToken);
        } else {
            throw e;
        }
    }
}

const authorize = payload => {
    const auth = createAuthorization(DefaultAuthorizationOptions, payload);
    return { "token": auth };
}

const isAuthorized = bearerToken => {
    return getAuthorization(DefaultAuthorizationOptions, bearerToken);
}

export { UserTypes, authorize, isAuthorized };

// authorize user
// check authorization
// extend jwt
// remove jwt
