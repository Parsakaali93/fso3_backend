const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()
  
  response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({})
      /*Funktion populate kutsu siis ketjutetaan kyselyä vastaavan metodikutsun
       (tässä tapauksessa find) perään. Populaten parametri määrittelee, että
        user-dokumenttien notes-kentässä olevat note-olioihin viittaavat id:t
         korvataan niitä vastaavilla dokumenteilla.*/
      .find({}).populate('notes', { content: 1, important: 1 })
    response.json(users)
  })

module.exports = usersRouter
//g