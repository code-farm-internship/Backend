import { ResponseT } from '@/types/response';

export const customResponse = <T>({ data, message, status }: ResponseT<T>) => {
    return {
        message,
        status,
        data,
    };
};

export default customResponse;
