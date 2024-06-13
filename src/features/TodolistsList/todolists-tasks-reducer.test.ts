import {
    TodolistDomainType,
    todolistsActions,
    todolistsReducer,
    todosThunks
} from 'features/TodolistsList/todolists.reducer'
import {tasksReducer, TasksStateType} from 'features/TodolistsList/tasks.reducer'
import {TodolistType} from 'features/TodolistsList/Todolist/todolists-api'
import {BaseAction} from "../../common/types";

test('ids should be equals', () => {
    const startTasksState: TasksStateType = {};
    const startTodolistsState: Array<TodolistDomainType> = [];

    let todolist: TodolistType = {
        title: 'new todolist',
        id: 'any id',
        addedDate: '',
        order: 0
    }
    const action: BaseAction<typeof todosThunks.addTodolist.fulfilled> = {
        type: todosThunks.addTodolist.fulfilled.type,
        payload: {todolist: todolist}
    }

    const endTasksState = tasksReducer(startTasksState, action)
    const endTodolistsState = todolistsReducer(startTodolistsState, action)

    const keys = Object.keys(endTasksState);
    const idFromTasks = keys[0];
    const idFromTodolists = endTodolistsState[0].id;

    expect(idFromTasks).toBe(action.payload.todolist.id);
    expect(idFromTodolists).toBe(action.payload.todolist.id);
});
