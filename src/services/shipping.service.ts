import axiosInstance from '@/config/axios.config';
import redisClient from '@/config/redis.config';
import { CACHE_KEYS } from '@/constants/redisCacheKey';
import customResponse from '@/helpers/response';
import { IDistrict, IProvince, IWard } from '@/types/ghn';
import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

const THREE_DAY = 259200;

export const getProvince = async (req: Request, res: Response) => {
    const cached = await redisClient.get(CACHE_KEYS.SHIPPING.PROVINCE);

    if (cached) {
        return res.status(StatusCodes.OK).json(
            customResponse({
                data: JSON.parse(cached),
                message: ReasonPhrases.OK,
                status: StatusCodes.OK,
            }),
        );
    }

    const { data: response } = await axiosInstance.get<IProvince[]>('shiip/public-api/master-data/province');
    // filter test data
    const filteredResponse = response.filter(
        (item) => !item.ProvinceName.includes('est') && !item.ProvinceName.includes('02'),
    );

    await redisClient.set(CACHE_KEYS.SHIPPING.PROVINCE, JSON.stringify(filteredResponse), {
        expiration: {
            type: 'EX',
            value: THREE_DAY,
        },
    });

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: filteredResponse,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};

export const getDistrict = async (req: Request, res: Response) => {
    const provinceId = +req.params.id;
    const cacheKey = `${CACHE_KEYS.SHIPPING.DISTRICT}-${provinceId}`;

    const cached = await redisClient.get(cacheKey);

    if (cached) {
        return res.status(StatusCodes.OK).json(
            customResponse({
                data: JSON.parse(cached),
                message: ReasonPhrases.OK,
                status: StatusCodes.OK,
            }),
        );
    }

    const { data: response } = await axiosInstance.post<IDistrict[]>('/shiip/public-api/master-data/district', {
        province_id: provinceId,
    });
    // filter test data
    const filteredResponse = response.filter((item) => !item.DistrictName.includes('est'));

    await redisClient.set(CACHE_KEYS.SHIPPING.PROVINCE, JSON.stringify(filteredResponse), {
        expiration: {
            type: 'EX',
            value: THREE_DAY,
        },
    });

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: filteredResponse,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};

export const getWard = async (req: Request, res: Response) => {
    const districtId = +req.params.id;
    const cacheKey = `${CACHE_KEYS.SHIPPING.WARD}-${districtId}`;

    const cached = await redisClient.get(cacheKey);

    if (cached) {
        return res.status(StatusCodes.OK).json(
            customResponse({
                data: JSON.parse(cached),
                message: ReasonPhrases.OK,
                status: StatusCodes.OK,
            }),
        );
    }

    const { data: response } = await axiosInstance.post<IWard[]>('shiip/public-api/master-data/ward?district_id', {
        district_id: districtId,
    });
    // filter test data
    const filteredResponse = response.filter((item) => !item.WardName.includes('est'));

    await redisClient.set(CACHE_KEYS.SHIPPING.WARD, JSON.stringify(filteredResponse), {
        expiration: {
            type: 'EX',
            value: THREE_DAY,
        },
    });
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: filteredResponse,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};
