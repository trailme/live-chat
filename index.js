const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const axios = require('axios')
const { sendnoti } = require('./slack.js')
const { QuickDB } = require('quick.db')
const { resolve } = require('path')
const localdb = new QuickDB()

var connectCounter = 0

async function updatecache(urlpath) {
  return new Promise((resolve, reject) => {
    var config = {
      method: 'get',
      url: 'https://1f53v2wgyk.execute-api.us-east-1.amazonaws.com/' + urlpath,
      headers: {},
    }

    axios(config)
      .then(function (response) {
        localdb.set(urlpath, JSON.stringify(response.data))
        resolve(response.data)
        // console.log(JSON.stringify(response.data))
      })
      .catch(function (error) {
        console.log(error)
      })
  })
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/alert', (req, res) => {
  res.sendFile(__dirname + '/alert.html')
})

app.get('/getallevents', async (req, res) => {
  const urlpath = 'getallevents'
  const localeventlist = await localdb.get(urlpath)
  if (localeventlist) res.send(localeventlist)
  const updatedresult = await updatecache(urlpath)
  if (!localeventlist) res.send(updatedresult)
})

app.get('/getcourses/:eventid', async (req, res) => {
  const urlpath = 'getcoursebyeventid/' + req.params.eventid
  const localeventlist = await localdb.get(urlpath)
  if (localeventlist) res.send(localeventlist)
  const updatedresult = await updatecache(urlpath)
  if (!localeventlist) res.send(updatedresult)
})

app.use(express.static('public'))

io.on('connection', (socket) => {
  console.log('a user connected')
  connectCounter++
  io.emit('connectCounter', connectCounter)
  // io.emit('chat message', { from: 'system', msg: 'Welcome new friend!' })
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg)
    io.emit('chat message', msg)
    sendnoti('chatroom: ' + JSON.stringify(msg))
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
