import {appActions} from "../../app/app.reducer";
import {handleServerNetworkError} from "./handle-server-network-error";
import {AppDispatch} from "../../app/store";
import {BaseResponseType} from "common/types";

type ThunkApi = {
    dispatch: AppDispatch
    rejectWithValue: (value: (BaseResponseType | null)) => any
}

export const thunkTryCatch = async (thunkApi: ThunkApi, logic: () => Promise<any>) => {
    const {dispatch, rejectWithValue} = thunkApi;
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        return await logic()
    } catch (err) {
        handleServerNetworkError(err, dispatch)
        return rejectWithValue(null)
    }
}