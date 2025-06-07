import mongoose from 'mongoose';

export function generateCouponCode(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01234456789';
    let code = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return code;
}

export async function generateUniqueCouponCode(): Promise<string> {
    let code = '';
    let exists = true;
    while (exists) {
        code = generateCouponCode(8);
        exists = (await mongoose.model('Coupon').exists({ code })) !== null;
    }
    return code;
}
