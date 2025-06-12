export interface ResponseT<T> {
    status: number;
    success: boolean;
    message: string;
    data: T;
}
