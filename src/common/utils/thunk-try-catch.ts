import {appActions} from "../../app/app.reducer";
import {handleServerNetworkError} from "./handle-server-network-error";
import {AppDispatch, AppRootStateType} from "../../app/store";
import {BaseResponseType} from "common/types";
import {BaseThunkAPI} from "@reduxjs/toolkit/dist/createAsyncThunk";

type ThunkApi = BaseThunkAPI<AppRootStateType, unknown, AppDispatch, null | BaseResponseType>
// Promise<{todolist: TodolistType} | RejectWithValue<BaseResponseType<{}> | null, unknown>>
export const thunkTryCatch = async <T>(thunkApi: ThunkApi, logic: () => Promise<T>): Promise<T | ReturnType<typeof thunkApi.rejectWithValue>> => {
    const {dispatch, rejectWithValue} = thunkApi;
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        return await logic()
    } catch (err) {
        handleServerNetworkError(err, dispatch)
        return rejectWithValue(null)
    } finally {
        dispatch(appActions.setAppStatus({status: 'idle'}))
    }
}