import {Dispatch} from "redux";
import {appActions} from "app/app.reducer";
import {BaseResponseType} from "common/types";

/**
 * Обрабатывает ошибки, полученные от сервера.
 * @template D - тип данных в ответе от сервера.
 * @param {BaseResponseType<D>} data - объект с ответом от сервера.
 * @param {Dispatch} dispatch - функция для отправки данных в Redux.
 * @param {boolean} [isShowGlobalError=true] - флаг, определяющий, нужно ли показывать глобальное сообщение об ошибке.
 * @returns {void} - ничего не возвращает
 */
export const handleServerAppError = <D>(data: BaseResponseType<D>, dispatch: Dispatch, isShowGlobalError: boolean = true) => {
    if(isShowGlobalError) {
        if (data.messages.length) {
            dispatch(appActions.setAppError({error: data.messages[0]}))
        } else {
            dispatch(appActions.setAppError({error: 'Some error occurred'}))
        }
    }
    dispatch(appActions.setAppStatus({status: 'failed'}))
}