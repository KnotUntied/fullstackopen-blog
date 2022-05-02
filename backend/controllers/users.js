const bcrypt = require('bcryptjs')

const usersRouter = require('express').Router()
const User = require('../models/user')


usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })

  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return response.status(400).json({
      error: 'username must be unique'
    })
  }

  if (username.length < 3) {
    return response.status(400).json({ error: 'username too short' })
  }

  if (password.length < 3) {
    return response.status(400).json({ error: 'password too short' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  try {
    var savedUser = await user.save()
  } catch (error) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return response.status(400).json({ error: 'username must be unique' })
    }
  }

  response.status(201).json(savedUser)
})

module.exports = usersRouter