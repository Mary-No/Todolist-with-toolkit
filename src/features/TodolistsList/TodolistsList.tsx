import React, {useCallback, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {
    FilterValuesType,
    selectTodolists,
    todolistsActions, todosThunks
} from 'features/TodolistsList/todolists.reducer'
import {selectTasks, tasksThunks} from 'features/TodolistsList/tasks.reducer'
import {Grid, Paper} from '@mui/material'
import {Todolist} from './Todolist/Todolist'
import {Navigate} from 'react-router-dom'
import {selectIsLoggedIn} from "features/auth/model/auth.reducer";
import {TaskStatuses} from "common/enums";
import {AddItemForm} from "common/components";
import {useActions} from "../../common/hooks/useActions";

type PropsType = {
    demo?: boolean
}

export const TodolistsList: React.FC<PropsType> = ({demo = false}) => {
    const todolists = useSelector(selectTodolists)
    const tasks = useSelector(selectTasks)
    const isLoggedIn = useSelector(selectIsLoggedIn)

    const {fetchTodolists, removeTask, addTask, updateTask, changeTodolistFilter, removeTodolist, changeTodolistTitle, addTodolist} = useActions()

    useEffect(() => {
        if (demo || !isLoggedIn) {
            return;
        }
        fetchTodolists()
    }, [])

    const removeTaskCB = useCallback(function (taskId: string, todolistId: string) {
        removeTask({taskId, todolistId})
    }, [])

    const addTaskCB = useCallback(function (title: string, todolistId: string) {
        addTask({title, todolistId})
    }, [])

    const changeStatus = useCallback(function (taskId: string, status: TaskStatuses, todolistId: string) {
        updateTask({taskId, domainModel: {status}, todolistId})
    }, [])

    const changeTaskTitle = useCallback(function (taskId: string, title: string, todolistId: string) {
        updateTask({taskId, domainModel: {title}, todolistId})
    }, [])

    const changeFilter = useCallback(function (value: FilterValuesType, todolistId: string) {
        changeTodolistFilter({id: todolistId, filter: value})
    }, [])

    const removeTodolistCB = useCallback(function (id: string) {
        removeTodolist(id)
    }, [])

    const changeTodolistTitleCB = useCallback(function (id: string, title: string) {
        changeTodolistTitle({id, title})
    }, [])

    const addTodolistCB = useCallback((title: string) => {
        addTodolist(title)
    }, [])

    if (!isLoggedIn) {
        return <Navigate to={"/login"}/>
    }

    return <>
        <Grid container style={{margin: '25px 0px'}}>
            <AddItemForm addItem={addTodolistCB}/>
        </Grid>
        <Grid container spacing={8}>
            {
                todolists.map(tl => {
                    let allTodolistTasks = tasks[tl.id]

                    return <Grid item key={tl.id}>
                        <Paper style={{padding: '5px 10px 25px 30px'}}>
                            <Todolist
                                todolist={tl}
                                tasks={allTodolistTasks}
                                removeTask={removeTaskCB}
                                changeFilter={changeFilter}
                                addTask={addTaskCB}
                                changeTaskStatus={changeStatus}
                                removeTodolist={removeTodolistCB}
                                changeTaskTitle={changeTaskTitle}
                                changeTodolistTitle={changeTodolistTitleCB}
                                demo={demo}
                            />
                        </Paper>
                    </Grid>
                })
            }
        </Grid>
    </>
}
