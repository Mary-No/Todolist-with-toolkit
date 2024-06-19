import {createSlice} from "@reduxjs/toolkit";
import {appActions} from "app/app.reducer";
import {clearTasksAndTodolists} from "common/actions/common.actions";
import {handleServerAppError, handleServerNetworkError, thunkTryCatch} from "common/utils";
import {authAPI} from "features/auth/api/authApi";
import {LoginParamsType} from "features/auth/api/authApi.types";
import {createAppAsyncThunk} from "../../../common/utils/create-app-async-thunk";
import {ResultCode} from "common/enums";


const slice = createSlice({
    name: 'auth',
    initialState: {isLoggedIn: false},
    reducers: {},
    selectors: {
        selectIsLoggedIn: sliceState => sliceState.isLoggedIn,
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn
            })
            .addCase(logout.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn
            })
            .addCase(initializeApp.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn
            })
    }
})


const login = createAppAsyncThunk<{
    isLoggedIn: boolean
}, LoginParamsType>(`${slice.name}/login`, async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        const res = await authAPI.login(arg)
        if (res.data.resultCode === ResultCode.Success) {
            dispatch(clearTasksAndTodolists());
            localStorage.setItem("sn-token", res.data.data.token);
            dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return {isLoggedIn: true}
        } else {
            const isShowAppError = !res.data.fieldsErrors.length
            handleServerAppError(res.data, dispatch, isShowAppError)
            return rejectWithValue(res.data)
        }
    } catch (err) {
        handleServerNetworkError(err, dispatch)
        return rejectWithValue(null)
    }
})


const logout = createAppAsyncThunk<{ isLoggedIn: boolean }, undefined>(`${slice.name}/logout`, async (_, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        const res = await authAPI.logout()
        if (res.data.resultCode === ResultCode.Success) {
            dispatch(clearTasksAndTodolists());
            localStorage.clear();
            dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return {isLoggedIn: false}
        } else {
            handleServerAppError(res.data, dispatch)
            return rejectWithValue(null)
        }
    } catch (err) {
        handleServerNetworkError(err, dispatch)
        return rejectWithValue(null)
    }
})


const initializeApp = createAppAsyncThunk<{
    isLoggedIn: boolean
}, undefined>(`${slice.name}/initializeApp`, async (_, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    const res = await authAPI.me()
    return thunkTryCatch(thunkAPI, async () => {
        if (res.data.resultCode === 0) {
            return {isLoggedIn: true}
        } else {

            handleServerAppError(res.data, dispatch, false)
            return rejectWithValue(null)
        }
    }).finally(()=>{
        dispatch(appActions.setAppInitialized({isInitialized: true}))
    })
})


export const authReducer = slice.reducer
export const {selectIsLoggedIn} = slice.selectors
export const authThunks = {login, logout, initializeApp}