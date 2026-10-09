import { parseAsString, useQueryState } from 'nuqs';

/** UI-only: forces a mock state via `?preview=`; remove once the API is wired. */
export function usePreviewScenario() {
	const [scenario] = useQueryState('preview', parseAsString);
	return scenario;
}
