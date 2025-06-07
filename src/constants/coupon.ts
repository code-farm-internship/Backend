export enum CouponTarget {
    PUBLIC = 'public',
    COLLECTABLE = 'collectable',
    NEW_USER = 'new_user',
}

export enum CouponDiscountType {
    PERCENTAGE = 'percentage',
    FIXED = 'fixed',
}
export enum CouponStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export enum CouponType {
    DISCOUNT = 'discount',
    FREESHIP = 'free_ship',
}

export const MAX_PERCENTAGE = 100;
export const MIN_PERCENTAGE = 0;
