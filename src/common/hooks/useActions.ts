import {tasksThunks} from "../../features/TodolistsList/tasks.reducer";
import {todolistsActions, todosThunks} from "../../features/TodolistsList/todolists.reducer";
import {authThunks} from "../../features/auth/model/auth.reducer";
import {useAppDispatch} from "./useAppDispatch";
import {bindActionCreators} from "redux";
import {useMemo} from "react";

const actionsAll = {...tasksThunks, ...todosThunks, ...todolistsActions, ...authThunks}
type AllActions = typeof actionsAll
type AllActionsBindDispatch = RemapActionCreators<AllActions>

export const useActions = () => {
    const dispatch = useAppDispatch();
    return useMemo(() => bindActionCreators<AllActions, AllActionsBindDispatch>(actionsAll, dispatch), [dispatch]);
}


type RemapActionCreators<T extends Record<string, any>> = {
    [K in keyof T]: (...args: Parameters<T[K]>) => ReturnType<ReturnType<T[K]>>
}