import { Archive, CheckCircle, CircleOff, Eraser } from 'lucide-react';
import { ItemStatus } from './enum';

export const statusOptions = [
	{
		label: 'Active',
		value: ItemStatus.ACTIVE,
		icon: CheckCircle,
	},
	{
		label: 'Inactive',
		value: ItemStatus.INACTIVE,
		icon: CircleOff,
	},
	{
		label: 'Archived',
		value: ItemStatus.ARCHIVED,
		icon: Archive,
	},
	{
		label: 'Draft',
		value: ItemStatus.DRAFT,
		icon: Eraser,
	},
];
