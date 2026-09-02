export type ApiResponse<T = any> = {
	statusCode: number;
	message: string;
	data?: T;
	pagination?: ApiPagination;
};

export type ApiPagination = {
	page: number;
	pageSize: number;
	total: number;
	pageCount: number;
};
