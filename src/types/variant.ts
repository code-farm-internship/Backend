import mongoose, { Schema, Types } from 'mongoose';

export interface IProductVariant extends mongoose.Document {
    image?: string;
    imageUrlRef?: string;
    price: number;
    stock: number;
    discountId?: Schema.Types.ObjectId;
    formatId: Schema.Types.ObjectId;
    imageRef?: string;
    sku: string;
}

export interface IVariantItem {
    _id: Types.ObjectId;
    image?: string;
    imageUrlRef?: string;
    price: number;
    stock: number;
    discountId?: Schema.Types.ObjectId;
    formatId: Schema.Types.ObjectId;
    imageRef?: string;
}
