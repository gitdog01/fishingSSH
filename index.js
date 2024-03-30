const { Server } = require('ssh2');
const fs = require('fs');

const sshServer = new Server(
    {
        hostKeys: [fs.readFileSync('host.key')],
    },
    (client) => {
        const clientIP = client._sock.remoteAddress;
        console.log(`Client connected from ${clientIP}`);

        client.on('authentication', (ctx) => {
            console.log(`Authentication method: ${ctx.method}`);
            if (
                ctx.method === 'password' &&
                ctx.username === 'your_username' &&
                ctx.password === 'your_password'
            ) {
                console.log(`Successful authentication for ${ctx.username} from ${clientIP}`);
                ctx.accept();
            } else {
                console.log(`Failed authentication attempt from ${clientIP}`);
                ctx.reject();
            }
        });

        client.on('ready', () => {
            console.log('Client authenticated!');
            client.on('session', (accept, reject) => {
                const session = accept();
                session.once('exec', (accept, reject, info) => {
                    console.log(`Client wants to execute: ${info.command}`);
                    const stream = accept();
                    // 클라이언트에게 응답 보내기
                    stream.stderr.write('Error: Command not supported\n');
                    stream.exit(1);
                    stream.end();
                });
            });
        });

        client.on('close', () => {
            console.log(`Connection from ${clientIP} closed`);
        });
    }
).listen(22, '0.0.0.0', () => {
    console.log('SSH Server listening on port 22');
});