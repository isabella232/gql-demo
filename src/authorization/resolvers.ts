import { authorize } from '../authorization/authorization'


export interface gqlRequest {
    authorizationTokenRequest: {
        userName: string;
        password: string;
    }
}

export const AuthMutations = {
    generateUserAuthToken(_: any, { authorizationTokenRequest }: gqlRequest) {
        debugger;
        if (authorizationTokenRequest.userName === 'testing') {
            const payload = {
                userName: 'admin test'
            }
            return authorize(payload);
        }
        return { "token": '' };
    }
}