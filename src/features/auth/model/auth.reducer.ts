import {PayloadAction, createSlice} from "@reduxjs/toolkit";
import {appActions} from "app/app.reducer";
import {clearTasksAndTodolists} from "common/actions/common.actions";
import {handleServerAppError, handleServerNetworkError} from "common/utils";
import {authAPI} from "features/auth/api/authApi";
import {LoginParamsType} from "features/auth/api/authApi.types";
import {createAppAsyncThunk} from "../../../common/utils/createAppAsyncThunk";


const slice = createSlice({
    name: 'auth',
    initialState: {isLoggedIn: false},
    reducers: {
        setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
            state.isLoggedIn = action.payload.isLoggedIn;
        },
    },
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
    }
})


const login = createAppAsyncThunk<{isLoggedIn: boolean}, LoginParamsType>(`${slice.name}/login`, async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        const res = await authAPI.login(arg)
        if (res.data.resultCode === 0) {
            dispatch(clearTasksAndTodolists());
            localStorage.setItem("sn-token", res.data.data.token);
            dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return {isLoggedIn: true}
        } else {
            handleServerAppError(res.data, dispatch)
            return rejectWithValue(null)
        }
    } catch (err){
        handleServerNetworkError(err, dispatch)
        return rejectWithValue(null)
    }
})


const logout = createAppAsyncThunk<{isLoggedIn: boolean}>(`${slice.name}/logout`, async (_, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        const res = await authAPI.logout()
        if (res.data.resultCode === 0) {
            dispatch(clearTasksAndTodolists());
            localStorage.clear();
            dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return {isLoggedIn: false}
        } else {
            handleServerAppError(res.data, dispatch)
            return rejectWithValue(null)
        }
    } catch (err){
        handleServerNetworkError(err, dispatch)
        return rejectWithValue(null)
    }
})


export const authActions = slice.actions
export const authReducer = slice.reducer
export const {selectIsLoggedIn} = slice.selectors
export const authThunks = {login, logout}