import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunk} from "app/store";
import {appActions} from "app/appSlice";
import {clearTasksAndTodolists} from "common/actions/common.actions";
import {handleServerAppError, handleServerNetworkError} from "common/utils";
import {authAPI} from "features/auth/api/authApi";
import {LoginParamsType} from "features/auth/api/authApi.types";



const slice = createSlice({
    name: 'auth',
    initialState: { isLoggedIn: false },
    reducers: {
        setIsLoggedIn: (state, action: PayloadAction<{isLoggedIn: boolean}>) => {
            state.isLoggedIn = action.payload.isLoggedIn
        },
    },
    selectors: {
        selectIsLoggedIn: sliceState => sliceState.isLoggedIn,
    }
})



// thunks
export const loginTC = (data: LoginParamsType): AppThunk => (dispatch) => {
    dispatch(appActions.setAppStatus({status: 'loading'}))
    authAPI.login(data)
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(authActions.setIsLoggedIn({isLoggedIn: true}))
                localStorage.setItem("sn-token", res.data.data.token);
                dispatch(appActions.setAppStatus({status: 'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
export const logoutTC = (): AppThunk => (dispatch) => {
    dispatch(appActions.setAppStatus({status: 'loading'}))
    authAPI.logout()
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(authActions.setIsLoggedIn({isLoggedIn: false}))
                dispatch(clearTasksAndTodolists());
                localStorage.clear();
                dispatch(appActions.setAppStatus({status: 'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}

export const authActions = slice.actions
export const authReducer = slice.reducer
export const {selectIsLoggedIn} = slice.selectors