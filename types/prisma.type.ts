export type FindManyArgs<
	TWhere = Record<string, unknown>,
	TSelect = unknown,
	TInclude = unknown,
	TOrderBy = unknown,
	TDistinct = string,
> = {
	select?: TSelect | null;
	omit?: Partial<Record<keyof TSelect, boolean>> | null;
	include?: TInclude | null;
	where?: TWhere;
	orderBy?: TOrderBy | TOrderBy[];
	cursor?: Partial<TWhere>; // usually unique fields
	take?: number;
	skip?: number;
	distinct?: TDistinct | TDistinct[];
	page?: number; // custom
	pageSize?: number; // custom
};
