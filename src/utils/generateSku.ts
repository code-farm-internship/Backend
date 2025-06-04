import mongoose from 'mongoose';

export const generateRandomSKU = async (): Promise<string> => {
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    const sku = `${randomNum}`;

    const existingVariant = await mongoose.model('ProductVariant').findOne({ sku });

    if (existingVariant) {
        return await generateRandomSKU();
    }
    return sku;
};
