import { RestService } from '@/services/rest.service';
import { RequestParams } from '@/types/rest.type';

const restService = RestService.getInstance();

export const create = async <T = unknown>(params: RequestParams) => {
	const { data: response } = await restService.create<T>(params);
	return response.data as T;
};

export const list = async <T = unknown>(params: RequestParams) => {
	const { data: response } = await restService.list<T>(params);
	return response.data as T;
};

export const listWithPagination = async <T = unknown>(
	params: RequestParams
) => {
	const { data: response } = await restService.list<T>(params);
	return {
		...response,
		data: response.data as T,
	};
};

export const update = async <T = unknown>(params: RequestParams) => {
	const { data: response } = await restService.update<T>(params);
	return response.data as T;
};

export const remove = async <T = unknown>(params: RequestParams) => {
	const { data: response } = await restService.remove<T>(params);
	return response.data as T;
};
