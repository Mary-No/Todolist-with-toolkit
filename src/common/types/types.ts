
export type BaseAction<T extends (...args: any)=> any> = Omit<ReturnType<T>, 'meta'>
// extends (...args: any)=> any  - эта запись означает, что ReturnType ожидает функцию и мы пишем, что дженерик функция

export type ResponseType<D = {}> = {
    resultCode: number
    messages: Array<string>
    data: D
}