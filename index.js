const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)

var connectCounter = 0

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/alert', (req, res) => {
  res.sendFile(__dirname + '/alert.html')
})

app.use(express.static('public'))

io.on('connection', (socket) => {
  console.log('a user connected')
  connectCounter++
  io.emit('connectCounter', connectCounter)
  io.emit('chat message', { from: 'system', msg: 'Welcome new friend!' })
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg)
    io.emit('chat message', msg)
  })
  socket.on('disconnect', () => {
    console.log('user disconnected')
    connectCounter--
    io.emit('connectCounter', connectCounter)
  })
})

server.listen(4000, () => {
  console.log('listening on *:4000')
})
