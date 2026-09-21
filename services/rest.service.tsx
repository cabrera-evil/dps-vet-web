import { ApiResponse } from '@/types/api.type';
import { RequestParams } from '@/types/rest.type';
import { appendToFormData } from '@/utils/form-data';
import axios, {
	AxiosError,
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
} from 'axios';
import { toast } from 'sonner';

interface QueueItem {
	resolve: (value?: any) => void;
	reject: (error?: any) => void;
}

export class RestService {
	private static instance: RestService;
	private readonly axiosInstance: AxiosInstance;
	private isRefreshing = false;
	private failedQueue: QueueItem[] = [];

	private constructor() {
		// TODO(self-hosted-api): once the backend fully lives in `app/api/**`,
		// point baseURL at this app's own `/api` (relative in the browser,
		// absolute origin on the server) and drop NEXT_PUBLIC_API_URL/PROXY/HOST.
		this.axiosInstance = axios.create({
			baseURL: process.env.NEXT_PUBLIC_PROXY
				? process.env.NEXT_PUBLIC_HOST
				: process.env.NEXT_PUBLIC_API_URL,
			withCredentials: true,
		});
		this.setupInterceptors();
	}

	public static getInstance() {
		RestService.instance ??= new RestService();
		return RestService.instance;
	}

	private setupInterceptors() {
		this.axiosInstance.interceptors.response.use(
			(response) => response,
			async (error: AxiosError<any>) => {
				const originalRequest = error.config as AxiosRequestConfig & {
					_retry?: boolean;
				};
				if (error.response?.status === 401 && !originalRequest._retry)
					return this.handleUnauthorized(originalRequest);
				this.showErrorToast(error);
				throw error;
			}
		);
	}

	private async handleUnauthorized(
		originalRequest: AxiosRequestConfig & { _retry?: boolean }
	) {
		if (this.isRefreshing) {
			return new Promise<any>((resolve, reject) => {
				this.failedQueue.push({ resolve, reject });
			}).then(() => this.axiosInstance(originalRequest));
		}
		originalRequest._retry = true;
		this.isRefreshing = true;
		try {
			await this.axiosInstance.post('/auth/refresh-token');
			this.processQueue(null);
			return this.axiosInstance(originalRequest);
		} catch (refreshError) {
			this.processQueue(refreshError);
			this.handleRefreshFailure();
			throw refreshError;
		} finally {
			this.isRefreshing = false;
		}
	}

	private processQueue(error: any) {
		this.failedQueue.forEach(({ resolve, reject }) =>
			error ? reject(error) : resolve()
		);
		this.failedQueue = [];
	}

	private showErrorToast(error: AxiosError<any>) {
		const title = error.response?.data?.message || 'An error occurred';
		const description = error.response?.data?.errors
			? Object.values(error.response.data.errors).flat().join(' ')
			: 'Please try again later.';
		if (process.env.NODE_ENV === 'development') console.error(error);
		toast.error(title, { id: 'api-error', description, duration: 5000 });
	}

	private handleRefreshFailure() {
		toast.error('Session expired', {
			description: 'Please log in again.',
			duration: 5000,
		});
	}

	private sanitizePayload<T extends Record<string, any>>(payload: T) {
		return Object.fromEntries(
			Object.entries(payload).filter(
				([_, value]) => value !== undefined && value !== ''
			)
		) as Partial<T>;
	}

	private buildFormData(payload: Record<string, any>) {
		const formData = new FormData();
		Object.entries(payload).forEach(([k, v]) => {
			appendToFormData(formData, k, v, { arrayBrackets: false });
		});
		return formData;
	}

	private buildHeaders(token?: string): Record<string, string> {
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	public create<T = unknown>({
		path,
		payload = {},
		params,
		token,
		contentType = 'json',
		responseType = 'json',
	}: RequestParams): Promise<AxiosResponse<ApiResponse<T>>> {
		const sanitizedPayload = this.sanitizePayload(payload);
		const body =
			contentType === 'form'
				? this.buildFormData(sanitizedPayload)
				: sanitizedPayload;
		return this.axiosInstance.post(path, body, {
			params,
			headers: this.buildHeaders(token),
			responseType,
		});
	}

	public list<T = unknown>({
		path,
		params,
		token,
		responseType = 'json',
	}: RequestParams): Promise<AxiosResponse<ApiResponse<T>>> {
		return this.axiosInstance.get(path, {
			params,
			headers: this.buildHeaders(token),
			responseType,
		});
	}

	public update<T = unknown>({
		path,
		payload = {},
		params,
		token,
		contentType = 'json',
		responseType = 'json',
	}: RequestParams): Promise<AxiosResponse<ApiResponse<T>>> {
		const sanitizedPayload = this.sanitizePayload(payload);
		const body =
			contentType === 'form'
				? this.buildFormData(sanitizedPayload)
				: sanitizedPayload;
		return this.axiosInstance.patch(path, body, {
			params,
			headers: this.buildHeaders(token),
			responseType,
		});
	}

	public remove<T = unknown>({
		path,
		params,
		token,
		responseType = 'json',
	}: RequestParams): Promise<AxiosResponse<ApiResponse<T>>> {
		return this.axiosInstance.delete(path, {
			params,
			headers: this.buildHeaders(token),
			responseType,
		});
	}
}
