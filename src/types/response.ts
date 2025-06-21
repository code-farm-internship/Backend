export interface ResponseT<T> {
    status: number;
    message: string;
    data: T;
}
