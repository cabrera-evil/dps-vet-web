'use client';

import { useEffect, useState } from 'react';

export function LiveClock() {
	const [time, setTime] = useState('');

	useEffect(() => {
		function update() {
			setTime(
				new Intl.DateTimeFormat('es-SV', {
					timeZone: 'America/El_Salvador',
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
					hour12: false,
				}).format(new Date())
			);
		}

		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	}, []);

	return <span className="tabular-nums">{time || '--:--:--'} CST</span>;
}
