import {instance} from "common/instance";
import {BaseResponseType} from "common/types";
import {LoginParamsType} from "./authApi.types";

export const authAPI = {
    login(data: LoginParamsType) {
        const promise = instance.post<BaseResponseType<{ userId?: number, token: string }>>('auth/login', data);
        return promise;
    },
    logout() {
        const promise = instance.delete<BaseResponseType<{ userId?: number }>>('auth/login');
        return promise;
    },
    me() {
        const promise = instance.get<BaseResponseType<{ id: number; email: string; login: string }>>('auth/me');
        return promise
    }
}
