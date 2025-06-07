import { ProductStatus } from '@/constants/enum';
import mongoose, { Schema } from 'mongoose';
interface ProductImage {
    imageUrl: string;
    imageRef: string;
}

interface ProductVariant {
    variantId: Schema.Types.ObjectId;
}
interface VariantFormat {
    formatId: Schema.Types.ObjectId;
}

interface PhysicalAttributes {
    width: number;
    heigh: number;
    length: number;
    weight: number;
}

interface DetailInformation {
    publisher?: Date;
    pages?: number;
    publicationDate?: Date;
    physicalAttributes?: PhysicalAttributes;
}

interface IPriceRange {
    min: number;
    max: number;
}

export interface IProduct extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    rating: number;
    reviewCount: number;
    author: string;
    sold: number;
    status: ProductStatus;
    thumbnail?: string;
    thumbnailRef?: string;
    library?: ProductImage[];
    isAvailable: boolean;
    priceRange: IPriceRange;
    detailInformation: DetailInformation;
    categoryId: Schema.Types.ObjectId;
    vendorId: Schema.Types.ObjectId;
    variants: ProductVariant[];
    variantFormats: VariantFormat[];
    slug: string;
}

export default IProduct;
