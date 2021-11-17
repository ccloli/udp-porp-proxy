const proxy = require('udp-proxy');
const host = process.env.HOST;
const ports = process.env.PORTS.split(/\s*,\s*/)
	.map(e => {
		if (e.includes('-')) {
			const [start, end] = e.split('-', 2);
			let result = [];
			for (let i = start; i <= end; i++) {
				result.push(+i);
			}
			return result;
		}
		return e;
	}).flat();

for (const i of ports) {
	const options = {
		address: host,
		port: i,
		localaddress: '0.0.0.0',
		localport: i,
		timeOutTime: 60e3,
	};

	const server = proxy.createServer(options);
	server.on('listening', (details) => {
		console.log(`[${i}] server is listening on ${details.server.address}:${details.server.port}`);
	});
	server.on('bound', (details) => {
		console.log(`[${i}] upstream ready from ${details.route.address}:${details.route.port} to ${details.peer.address}:${details.peer.port}`);
	});
	server.on('message', (message, sender) => {
		console.log(`[${i}] request from ${sender.address}:${sender.port}`);
		console.log(message.toString('hex'));
		console.log('');
	});
	server.on('proxyMsg', (message, sender, peer) => {
                console.log(`[${i}] response to  ${peer.address}:${peer.port}`);
                console.log(message.toString('hex'));
		console.log('');
        });
	server.on('proxyClose', (peer) => {
		console.log(`[${i}] ${peer.address}:${peer.port} disconnected`);
	});
	server.on('proxyError', (err) => {
		console.error(`[${i}] upstream error`, err);
	});
	server.on('error', (err) => {
		console.error(`[${i}] server error`, err);
	});
};
