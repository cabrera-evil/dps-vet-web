import { io, Socket } from 'socket.io-client';

export class SocketService {
	private static instance: SocketService;

	private socket: Socket | null = null;

	private readonly SOCKET_URL =
		process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, (match) =>
			match.startsWith('https') ? 'wss://' : 'ws://'
		)?.replace(/\/api/g, '') ?? '';

	static getInstance(): SocketService {
		this.instance ??= new SocketService();
		return this.instance;
	}

	init = (token?: string) => {
		if (this.socket) return;
		this.socket = io(this.SOCKET_URL, token ? { auth: { token } } : {});
	};

	on = <T>(event: string, callback: (data: T) => void) => {
		this.getSocket()?.on(event, callback);
	};

	off = (event: string) => {
		this.getSocket()?.off(event);
	};

	emit = <T>(event: string, data: T) => {
		this.getSocket()?.emit(event, data);
	};

	join = (room: string) => {
		this.emit('join', room);
	};

	leave = (room: string) => {
		this.emit('leave', room);
	};

	disconnect = () => {
		this.getSocket()?.disconnect();
		this.socket = null;
	};

	private getSocket = (): Socket | null => {
		return this.socket ?? null;
	};
}
