import axiosInstance from '@/config/axios.config';
import customResponse from '@/helpers/response';
import { IDistrict, IProvince, IWard } from '@/types/Ghn';
import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const getProvince = async (req: Request, res: Response) => {
    const { data: response } = await axiosInstance.get<IProvince[]>('shiip/public-api/master-data/province');
    // filter test data
    const filteredResponse = response.filter((item) => !item.ProvinceName.includes('est'));

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: filteredResponse,
            success: true,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};

export const getDistrict = async (req: Request, res: Response) => {
    const provinceId = +req.params.id;
    const { data: response } = await axiosInstance.post<IDistrict[]>('/shiip/public-api/master-data/district', {
        province_id: provinceId,
    });
    // filter test data
    const filteredResponse = response.filter((item) => !item.DistrictName.includes('est'));

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: filteredResponse,
            success: true,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};

export const getWard = async (req: Request, res: Response) => {
    const districtId = +req.params.id;
    const { data: response } = await axiosInstance.post<IWard[]>('shiip/public-api/master-data/ward?district_id', {
        district_id: districtId,
    });
    // filter test data
    const filteredResponse = response.filter((item) => !item.WardName.includes('est'));

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: filteredResponse,
            success: true,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};
