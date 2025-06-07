import { ProductLanguage, ProductStatus } from '@/constants/enum';
import slugMiddleware from '@/middlewares/generateSlugMidleware';
import IProduct from '@/types/product';
import mongoose, { Schema } from 'mongoose';

const detailInformationSchema = new Schema(
    {
        publisher: { type: Date },
        pages: { type: Number },
        publicationDate: { type: Date },
        languague: {
            type: String,
            enum: Object.values(ProductLanguage),
            default: ProductLanguage.Vietnamese,
        },
        physicalAttributes: {
            width: { type: Number, default: 0 },
            height: { type: Number, default: 0 },
            length: { type: Number, default: 0 },
            weight: { type: Number, default: 0 },
        },
    },
    { _id: false },
);

const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        rating: {
            type: Number,
            default: 0,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
        sold: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: Object.values(ProductStatus),
            default: ProductStatus.NEW,
        },
        thumbnail: {
            type: String,
        },
        thumbnailRef: {
            type: String,
        },
        library: {
            type: [
                {
                    imageUrl: { type: String },
                    imageRef: { type: String },
                    _id: false,
                },
            ],
            default: [],
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        detailInformation: {
            type: detailInformationSchema,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true,
        },
        author: { type: String, required: true },
        variants: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'ProductVariant',
                },
            ],
            default: [],
        },
        priceRange: {
            min: {
                type: Number,
                default: 0,
            },
            max: {
                type: Number,
                default: 0,
            },
        },
        variantFormats: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Format',
                },
            ],
            default: [],
        },
        slug: {
            type: String,
            unique: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

productSchema.plugin(slugMiddleware('name', 'slug'));

const Product = mongoose.model('Product', productSchema);
export default Product;
