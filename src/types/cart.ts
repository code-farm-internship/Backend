import { Document, Types } from 'mongoose';
import { IUserCoupon } from './user';

export interface IUser extends Document {
    _id: Types.ObjectId;
    coupons: IUserCoupon[];
}

//
export interface ICart extends Document {
    _id: Types.ObjectId;
    userId: IUser;
}
