const express = require('express')
const session = require('express-session')
const RedisStore = require("connect-redis")(session)
const { createClient } = require('redis')

let redisClient = createClient({
  legacyMode: true,
  url: process.env.REDIS_URL ? process.env.REDIS_URL : 'redis://127.0.0.1:6379'
})
redisClient.connect().catch(console.error)

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
})

const app = express()
const port = 3000

app.use(session({
  store: redisStore,
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.get('/', (req, res) => {
  req.session.views = 1;
  res.send('Hello World!')
})

app.get('/save', (req, res) => {
  try {
    req.session.user = {
      token: '232534563463dfg345'
    };
    
    req.session.save(function(err) {
      res.send('Hello User!')
    })
  } catch (error) {
    req.sendStatus(500)
  }
})

app.get('/token', (req, res) => {
  try {
    const { user } = req.session
    if (!user) res.send('404')
    res.json(user)
  } catch (error) {
    res.send('404')
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})