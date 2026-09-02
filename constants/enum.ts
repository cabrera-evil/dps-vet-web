export enum Role {
	USER = 'USER',
	ADMIN = 'ADMIN',
	SUPER_ADMIN = 'SUPER_ADMIN',
}

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
