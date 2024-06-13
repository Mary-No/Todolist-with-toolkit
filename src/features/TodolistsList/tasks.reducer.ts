import {
    CreateTaskArgs, RemoveTaskArgs,
    TaskType,
    todolistsAPI, UpdateTaskArgs,
    UpdateTaskModelType
} from 'features/TodolistsList/Todolist/todolists-api'
import {AppThunk} from 'app/store'
import {appActions} from "app/appSlice";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {todolistsActions, todosThunks} from "features/TodolistsList/todolists.reducer";
import {clearTasksAndTodolists} from "common/actions/common.actions";
import {createAppAsyncThunk} from "common/utils/createAppAsyncThunk";
import {handleServerAppError, handleServerNetworkError} from "common/utils";
import {TaskPriorities, TaskStatuses} from "common/enums";



const slice = createSlice({
    name: "tasks",
    initialState: {} as TasksStateType,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchTasks.fulfilled, (state, action) => {
                state[action.payload.todolistId] = action.payload.tasks;
            })
            .addCase(addTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.task.todoListId]
                tasks.unshift(action.payload.task)

            })
    .addCase(removeTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex(task => task.id === action.payload.taskId)
                if (index !== -1) tasks.splice(index, 1)

            })
    .addCase(updateTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex(task => task.id === action.payload.taskId)
                if (index !== -1) tasks[index] = {...tasks[index], ...action.payload.domainModel}
            })
    .addCase(todosThunks.addTodolist.fulfilled, (state, action) => {
                state[action.payload.todolist.id] = [];
            })
    .addCase(todosThunks.removeTodolist.fulfilled, (state, action) => {
                delete state[action.payload.todolistId]
            })
    .addCase(todosThunks.fetchTodolists.fulfilled, (state, action) => {
                action.payload.todolists.forEach(tl => {
                    state[tl.id] = [];
                })
            })
    .addCase(clearTasksAndTodolists, () => {
                return {};
            })
    },
    selectors: {selectTasks: sliceState => sliceState}
})

const fetchTasks = createAppAsyncThunk<{ tasks: TaskType[], todolistId: string }, string>(`${slice.name}/fetchTasks`,
    async (todolistId: string, {dispatch, rejectWithValue}) => {
        try {
            dispatch(appActions.setAppStatus({status: 'loading'}));
            const res = await todolistsAPI.getTasks(todolistId);
            const tasks = res.data.items
            dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return {tasks, todolistId}
        } catch (err) {
            handleServerNetworkError(err, dispatch)
            return rejectWithValue(null)
        }
    });

const addTask = createAppAsyncThunk<{ task: TaskType }, CreateTaskArgs>(`${slice.name}/addTask`, async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        const res = await todolistsAPI.createTask(arg)
        if (res.data.resultCode === 0) {
            dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return {task: res.data.data.item}

        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null)
        }
    } catch (err) {
        handleServerNetworkError(err, dispatch)
        return rejectWithValue(null)
    }
})

const removeTask = createAppAsyncThunk<RemoveTaskArgs, RemoveTaskArgs>(`${slice.name}/removeTask`, async({taskId, todolistId}, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        const res = await todolistsAPI.deleteTask(todolistId, taskId)
        if (res.data.resultCode === 0) {
            dispatch(appActions.setAppStatus({status: 'succeeded'}))
            console.log(res);
            return {taskId, todolistId}

        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null)
        }
    } catch (err) {
        handleServerNetworkError(err, dispatch)
        return rejectWithValue(null)
    }
})


const updateTask = createAppAsyncThunk<UpdateTaskArgs, UpdateTaskArgs>(`${slice.name}/updateTask`, async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue, getState} = thunkAPI
    try {
        const state = getState()
        const task = state.tasks[arg.todolistId].find(t => t.id === arg.taskId)
        if (!task) {
            dispatch(appActions.setAppError({error: 'Some error occurred'}))
            return rejectWithValue(null)
        }
        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...arg.domainModel
        }
        const res = await todolistsAPI.updateTask(arg.todolistId, arg.taskId, apiModel)
        if (res.data.resultCode === 0) {
            return arg
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
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}

export const tasksReducer = slice.reducer
export const tasksThunks = {fetchTasks, addTask, updateTask, removeTask}
export const {selectTasks} = slice.selectors