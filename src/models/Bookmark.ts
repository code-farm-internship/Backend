import mongoose, { Schema } from 'mongoose';
import { IBookmark } from '@/types/bookmark';

const bookmarkSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        note: {
            type: String,
        },
    },
    {
        versionKey: false,
        timestamps: false,
    },
);

const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
export default Bookmark;
