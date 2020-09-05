const express = require('express')
const http = require('http')
const rootPath = require('../utils/rootPath')
const { generateLocationMessage,generateMessage,sanitize } = require('./utils/messages')
const socketio = require('socket.io')

const {addUser,getUser,getUsersInRoom,removeUser} = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server)
const port = process.env.PORT || 3000;


app.use(express.static(rootPath+'/public'));


io.on('connection', (socket) => {
    console.log('New webSocket connected');

    

    socket.on('join', (options, callback) =>{
        const {error, user} = addUser({id:socket.id,...options})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin',`Welcome ${user.username} !`));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`));
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (msg,callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username,sanitize(msg)));
        callback()
    })

    socket.on('sendLocation', ({ latitude, longitude }, cb) => {
        const user = getUser(socket.id)
        io.to(user.room).emit(
					'locationMessage',
            generateLocationMessage(user.username,`https://google.com/maps?q=${latitude},${longitude}`)
				);
        cb()
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left`));
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        
    })
    
})

server.listen(port,() => {
    console.log(`Serving on port ${port}`);
})
