import Spinner from '@/components/loader/spinner';
import React from 'react';

const Loading: React.FC = () => {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<Spinner size={40} className="text-primary" />
		</div>
	);
};

export default Loading;
