import { IProductVariant } from '@/types/variant';
import { generateRandomSKU } from '@/utils/generateSku';
import mongoose, { Schema } from 'mongoose';

const variantSchema = new Schema<IProductVariant>(
    {
        image: {
            type: String,
        },
        imageUrlRef: {
            type: String,
        },
        price: {
            type: Number,
            required: true,
        },
        stock: {
            type: Number,
            required: true,
        },
        discountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Discount',
        },
        formatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Format',
            required: true,
        },
        sku: {
            type: String,
            unique: true,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    },
);

variantSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.sku = await generateRandomSKU();
    }
    next();
});

const ProductVariant = mongoose.model('ProductVariant', variantSchema);
export default ProductVariant;
