import {
    ChangeTodolistTitleArgs,
    todolistsAPI,
    TodolistType
} from 'features/TodolistsList/Todolist/todolists-api'
import {appActions, RequestStatusType} from 'app/app.reducer'
import {handleServerNetworkError} from 'common/utils/handle-server-network-error'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {clearTasksAndTodolists} from "common/actions/common.actions";
import {createAppAsyncThunk} from "common/utils/create-app-async-thunk";
import {handleServerAppError, thunkTryCatch} from "../../common/utils";
import {ResultCode} from 'common/enums';


const slice = createSlice({
    name: "todolists",
    initialState: [] as TodolistDomainType[],
    reducers: {
        changeTodolistFilter: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {
            const index = state.findIndex(todo => todo.id === action.payload.id)
            if (index !== -1) state[index].filter = action.payload.filter
        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string, status: RequestStatusType }>) => {
            const todolist = state.find(todo => todo.id === action.payload.id)
            if (todolist) todolist.entityStatus = action.payload.status
        },
    },
    extraReducers: (builder) => {
        builder.addCase(clearTasksAndTodolists, () => {
            return [];
        })
            .addCase(fetchTodolists.fulfilled, (state, action) => {
                return action.payload.todolists.map((tl) => ({...tl, filter: "all", entityStatus: "idle"}));
            })
            .addCase(removeTodolist.fulfilled, (state, action) => {
                const index = state.findIndex(todo => todo.id === action.payload.todolistId)
                if (index !== -1) state.splice(index, 1)
            })
            .addCase(addTodolist.fulfilled, (state, action) => {
                state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
            })
            .addCase(changeTodolistTitle.fulfilled, (state, action) => {
                const index = state.findIndex(todo => todo.id === action.payload.id)
                if (index !== -1) state[index].title = action.payload.title
            })
    },
    selectors: {
        selectTodolists: sliceState => sliceState,
    },
})

const fetchTodolists = createAppAsyncThunk<{ todolists: TodolistType[] }, void>(`${slice.name}/fetchTodolists`,
    async (_, thunkAPI) => { //спросить
        const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appActions.setAppStatus({status: 'loading'}));
            const res = await todolistsAPI.getTodolists();
            dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return {todolists: res.data}
        } catch (err) {
            handleServerNetworkError(err, dispatch)
            return rejectWithValue(null)
        }
    });

const removeTodolist = createAppAsyncThunk<{
    todolistId: string
}, string>(`${slice.name}/removeTodolist`, async (todolistId, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        dispatch(todolistsActions.changeTodolistEntityStatus({id: todolistId, status: "loading"}))
        const res = await todolistsAPI.deleteTodolist(todolistId)
        if (res.data.resultCode === ResultCode.Success) {
            dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return {todolistId}
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null)
        }
    } catch (err) {
        handleServerNetworkError(err, dispatch)
        return rejectWithValue(null)
    }
})

const addTodolist = createAppAsyncThunk<{todolist: TodolistType}, string>(`${slice.name}/addTodolist`, async (title: string, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI

    return thunkTryCatch(thunkAPI, async () => {
        const res = await todolistsAPI.createTodolist(title)
        if (res.data.resultCode === ResultCode.Success) {
            dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return {todolist: res.data.data.item}
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null)
        }
    })
})

const changeTodolistTitle = createAppAsyncThunk<ChangeTodolistTitleArgs, ChangeTodolistTitleArgs>(`${slice.name}/changeTodolistTitle`, async ({id, title}, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        const res = await todolistsAPI.updateTodolist(id, title)
        if (res.data.resultCode === ResultCode.Success) {
            dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return {id, title}
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null)
        }
    } catch (err) {
        handleServerNetworkError(err, dispatch)
        return rejectWithValue(null)
    }
})


// types
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}

export const todolistsReducer = slice.reducer
export const todolistsActions = slice.actions
export const todosThunks = {fetchTodolists, removeTodolist, addTodolist, changeTodolistTitle}
export const {selectTodolists} = slice.selectors
