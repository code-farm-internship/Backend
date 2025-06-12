export interface IProvince {
    ProvinceID: number;
    ProvinceName: string;
    Code: string;
}

export interface IDistrict {
    DistrictID: number;
    ProvinceID: number;
    DistrictName: string;
}

export interface IWard {
    DistrictID: number;
    WardCode: number;
    WardName: string;
}
