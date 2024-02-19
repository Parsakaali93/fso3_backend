const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

const jwt = require('jsonwebtoken')

const getTokenFrom = request => {  
  const authorization = request.get('authorization')

  if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '')
        }  

  return null
}

/* The router we defined is used if the URL of the request starts with /api/notes.
 For this reason, the notesRouter object must only define the relative parts of the routes,
i.e. the empty path / or just the parameter /:id. */

// Kaikkien muistiinpanojen nouto
notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({})
  .find({}).populate('user', { username: 1, name: 1 })

  /* Korostetaan vielä, että tietokannan tasolla ei siis ole mitään määrittelyä sille, että esim.
  muistiinpanojen kenttään user talletetut id:t viittaavat users-kokoelman dokumentteihin.

  Mongoosen populate-funktion toiminnallisuus perustuu siihen, että olemme
  määritelleet viitteiden "tyypit" olioiden Mongoose-skeemaan ref-kentän avulla */
  response.json(notes)
  
})

// Yhden muistiinpanon nouto
notesRouter.get('/:id', async (request, response) => {
  const note = await Note.findById(request.params.id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})


// Uuden muistiinpanon lisäys
notesRouter.post('/', async (request, response) => {
  const body = request.body

  /* Apufunktio getTokenFrom eristää tokenin headerista authorization.
   Tokenin oikeellisuus varmistetaan metodilla jwt.verify. Metodi myös 
   dekoodaa tokenin, eli palauttaa olion, jonka perusteella token on laadittu: */
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })  
  }  
  
  const user = await User.findById(decodedToken.id)

  //const user = await User.findById(body.userId)

  console.log(request.body)
  console.log(body.content)
  const note = new Note({
    content: body.content,
    important: body.important === undefined ? false : body.important,
    user: user._id
  })

  const savedNote = await note.save()
  /*Huomionarvoista on nyt se, että myös user-olio muuttuu. Sen kenttään notes
   talletetaan luodun muistiinpanon id: Koska tieto tallennetaan user-olioon
    tulee muistiinpanoa poistettaessa tieto poistaa myös user-olion listalta. */
  user.notes = user.notes.concat(savedNote._id)
  await user.save()
  response.status(201).json(savedNote)
})



notesRouter.delete('/:id', async (request, response) => {
  await Note.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

// ILMAN express-async-errors-KIRJASTOA
/*
notesRouter.delete('/:id', async (request, response, next) => {
  try {
    await Note.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (exception) {
    next(exception)
  }
})
*/

notesRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

module.exports = notesRouter