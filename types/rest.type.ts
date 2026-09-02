import { ResponseType } from 'axios';

export interface RequestParams {
	path: string;
	payload?: Record<string, any>;
	params?: Record<string, any>;
	token?: string;
	contentType?: 'json' | 'form';
	responseType?: ResponseType;
}
