export enum Provider {
	LOCAL = 'LOCAL',
	GOOGLE = 'GOOGLE',
	GITHUB = 'GITHUB',
}

export enum ItemStatus {
	DRAFT = 'DRAFT',
	ACTIVE = 'ACTIVE',
	ARCHIVED = 'ARCHIVED',
	INACTIVE = 'INACTIVE',
}

export enum ItemPriority {
	LOW = 'LOW',
	MEDIUM = 'MEDIUM',
	HIGH = 'HIGH',
}

export enum ContactStatus {
	NEW = 'NEW',
	READ = 'READ',
	REPLIED = 'REPLIED',
	ARCHIVED = 'ARCHIVED',
}

export enum AuditAction {
	CREATE = 'CREATE',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
}

export enum AppointmentStatus {
	PENDING = 'PENDING',
	CONFIRMED = 'CONFIRMED',
	ATTENDED = 'ATTENDED',
	CANCELLED = 'CANCELLED',
	NO_SHOW = 'NO_SHOW',
}

export enum OrderStatus {
	PENDING = 'PENDING',
	FULFILLED = 'FULFILLED',
	CANCELLED = 'CANCELLED',
}
