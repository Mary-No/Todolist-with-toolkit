import {todolistsAPI, TodolistType} from 'features/TodolistsList/Todolist/todolists-api'
import {appActions, RequestStatusType} from 'app/appSlice'
import {handleServerNetworkError} from 'common/utils/handleServerNetworkError'
import {AppThunk} from 'app/store';
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {clearTasksAndTodolists} from "common/actions/common.actions";
import {createAppAsyncThunk} from "common/utils/createAppAsyncThunk";


const slice = createSlice({
    name: "todolists",
    initialState: [] as TodolistDomainType[],
    reducers: {
        removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
            const index = state.findIndex(todo => todo.id === action.payload.id)
            if (index !== -1) state.splice(index, 1)
        },
        addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
        },
        changeTodolistTitle: (state, action: PayloadAction<{ id: string, title: string }>) => {
            const index = state.findIndex(todo => todo.id === action.payload.id)
            if (index !== -1) state[index].title = action.payload.title
        },
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
            return action.payload.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }));
        })
    },
    selectors:{
        selectTodolists: sliceState => sliceState,
    },
})

const fetchTodolists = createAppAsyncThunk<{todolists: TodolistType[]}, void>(`${slice.name}/fetchTodolists`,
    async (_, thunkAPI) => { //спросить
        const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appActions.setAppStatus({status: 'loading'}));
            const res = await todolistsAPI.getTodolists();
            dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return {todolists: res.data}  //спросить
        } catch (err) {
            handleServerNetworkError(err, dispatch)
            return rejectWithValue(null)
        }
    });
// thunks
// export const fetchTodolistsTC = (): AppThunk => {
//     return (dispatch) => {
//         dispatch(appActions.setAppStatus({status: 'loading'}))
//         todolistsAPI.getTodolists()
//             .then((res) => {
//                 dispatch(todolistsActions.setTodolists({todolists: res.data}))
//                 dispatch(appActions.setAppStatus({status: 'succeeded'}))
//             })
//             .catch(error => {
//                 handleServerNetworkError(error, dispatch);
//             })
//     }
// }
export const removeTodolistTC = (todolistId: string): AppThunk => {
    return (dispatch) => {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        dispatch(todolistsActions.changeTodolistEntityStatus({id: todolistId, status: 'loading'}))
        todolistsAPI.deleteTodolist(todolistId)
            .then(() => {
                dispatch(todolistsActions.removeTodolist({id: todolistId}))
                //скажем глобально приложению, что асинхронная операция завершена
                dispatch(appActions.setAppStatus({status: 'succeeded'}))
            })
    }
}
export const addTodolistTC = (title: string): AppThunk => {
    return (dispatch) => {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                dispatch(todolistsActions.addTodolist({todolist: res.data.data.item}))
                dispatch(appActions.setAppStatus({status: 'succeeded'}))
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
    return (dispatch) => {
        todolistsAPI.updateTodolist(id, title)
            .then(() => {
                dispatch(todolistsActions.changeTodolistTitle({id, title}))
            })
    }
}

// types
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
export const todolistsReducer = slice.reducer
export const todolistsActions = slice.actions
export const todosThunks = {fetchTodolists}
export const {selectTodolists} = slice.selectors
