import { Types } from 'mongoose';

export interface IBookmark {
    userId: Types.ObjectId;
    productId: Types.ObjectId;
    note?: string;
}
