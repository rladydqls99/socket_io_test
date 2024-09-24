import express from 'express';

import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url'
import {dirname} from 'node:path'

import {Server} from "socket.io";

// express app 설정
const app = express();
const server = createServer(app);

// server 객체를 전달하여 socket.io 인스턴스 초기화
const io = new Server(server, {
    // 이것을 설정해주면 연결이 해제되었다가 다시 연결됐을 때, 밀렸던 메세지가 한꺼번에 전송됨
    connectionStateRecovery: {}
});

// __dirname 변수를 설정하여 현재 디렉토리를 가져옴(__를 붙이는 이유는 전역 변수처럼 보이게 하는 관례)
const __dirname = dirname(fileURLToPath(import.meta.url));

// 루트 경로에서 index.html 파일을 클라이언트에 전송
app.get('/', (req,res) => {
    res.sendFile(__dirname + '/index.html');
})

// socket.io 이벤트 리스너
io.on('connection', async (socket) => {
    console.log('a user connected');

    //sender인 socket의 클라이언트는 제외
    socket.broadcast.emit('hi');

    // 모든 클라이언트에게 메시지 전송
    socket.on('chat message', (message) => {
        console.log(`message: ${message}`);

        // 기본적인 메세지 전달 방식
        // io.emit('chat message', message);

        // emit에서도 callback을 적용할 수 있으며, timeout 설정을 통해 메세지를 기다릴 수 있음
        socket.timeout(3000).emit('chat message', message, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                console.log(res);
            }
        });
    })

    // emit이 아닌 emitWithAck을 통해 Promise를 전달받을 수 있으며, 응답 확인이 명확하게 필요한 경우 사용하면 좋음

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
})

// listen to the server
server.listen(3001, () => {
    console.log('Server is running on port 3001');
})
