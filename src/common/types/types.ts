
export type BaseAction<T extends (...args: any)=> any> = Omit<ReturnType<T>, 'meta'>
// extends (...args: any)=> any  - эта запись означает, что ReturnType ожидает функцию и мы пишем, что дженерик функция

export type BaseResponseType<D = {}> = {
    resultCode: number
    messages: Array<string>
    data: D
    fieldsErrors: FieldErrorType[]
}
export type FieldErrorType = {
    error: string
    field: string
}