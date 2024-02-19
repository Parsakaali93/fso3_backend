const config = require('./utils/config')
const express = require('express')
const app = express()

const cors = require('cors')

const logger = require('./utils/logger')

const mongoose = require('mongoose')

require('express-async-errors')


const notesRouter = require('./controllers/notes')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')

mongoose.set('strictQuery', false)

// Note-Moduulin käyttöönotto tapahtuu lisäämällä tiedostoon index.js seuraava rivi
// Näin muuttuja Note saa arvokseen saman olion, jonka moduuli määrittelee.
//const Note = require('./models/note')
/*
let notes = [
  {
    id: 1,
    content: 'HTML is easy',
    important: true
  },
  {
    id: 2,
    content: 'Browser can execute only JavaScript',
    important: false
  },
  {
    id: 3,
    content: 'GET and POST are the ',
    important: true
  },
  {
    id: 4,
    content: 'Neljas Nootti ',
    important: true
  }
]*/

console.log('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)

  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

  /*Jotta pääsisimme POST-pyynnön mukana lähetettyyn dataan helposti 
käsiksi, tarvitsemme Expressin tarjoaman json-parserin apua. */
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

app.use(middleware.requestLogger)

app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)
app.use('/api/notes', notesRouter)
if (process.env.NODE_ENV === 'test') {
    const testingRouter = require('./controllers/testing')
    app.use('/api/testing', testingRouter
)}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)
/* Jotta saamme Expressin näyttämään staattista sisältöä eli sivun index.html
 ja sen lataaman JavaScriptin ym. tarvitsemme Expressiin sisäänrakennettua middlewarea static. */
/*
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})*/


// VANHOJA ENNEN ROUTERIA
/*
// Käsittelee sovelluksen juureen tulevia pyyntöjä
app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

*/

// tämä tulee kaikkien muiden middlewarejen rekisteröinnin jälkeen!

// VANHA ILMAN MONGOA
/*
// Käsittelee polkuun /api/notes tulevia pyyntöjä
app.get('/api/notes', (req, res) => {
  // huomaa että ei tarvitse stringify-metodia kuten pelkässä Nodessa
  res.json(notes)
}) */


/*
Seuraavaksi määritellään sovellukselle kaksi routea.
 Näistä ensimmäinen määrittelee tapahtumankäsittelijän,
  joka hoitaa sovelluksen juureen eli polkuun / tulevia HTTP GET ‑pyyntöjä:

  Tapahtumankäsittelijäfunktiolla on kaksi parametria. Näistä ensimmäinen eli request
   sisältää kaikki HTTP-pyynnön tiedot ja toisen parametrin response:n avulla määritellään, miten pyyntöön vastataan.

Koodissa pyyntöön vastataan käyttäen response-olion metodia send, jonka kutsumisen
 seurauksena palvelin vastaa HTTP-pyyntöön lähettämällä selaimelle vastaukseksi
  send:in parametrina olevan merkkijonon <h1>Hello World!</h1>. Koska parametri 
  on merkkijono, asettaa Express vastauksessa Content-Type-headerin arvoksi text/html.
   Statuskoodiksi tulee oletusarvoisesti 200. 
*/

// ROUTE YKSITTÄISEN RESURSSIN KATSOMISTA VARTEN
/*
app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } 
      else {
        response.status(404).end()
      }
    })

    .catch(error => {
      
      //console.log(error)
      //response.status(400).send({ error: 'malformatted id' })
      

      next(error)
    })
})
*/

// VANHA 
/*
app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  
  const note = notes.find(note => {
    return note.id === id
  })

  if(note)
  {
    response.json(note)
  }

  // Jos id:llä ei löydy notea lähetetään 404 error
  else
  {
    // Koska vastaukseen ei nyt liity mitään dataa, käytetään statuskoodin asettavan
    // metodin status lisäksi metodia end ilmoittamaan siitä, että pyyntöön tulee vastata ilman dataa.
    response.status(404).end()
  }

  console.log(note, typeof note)

})
*/



// const generateId = () => {
//   const maxId = notes.length > 0
//     ? Math.max(...notes.map(n => n.id))
//     : 0
//   return maxId + 1
// }

// // ROUTE RESURSSIN VASTAANOTTOA VARTEN
// app.post('/api/notes', (request, response, next) => {
//   const body = request.body

//   // We require the content field to not be empty
//   if (body.content === undefined) {
//     // Return is important, otherwise the function will
//     // continue and post the note into the database
//     return response.status(400).json({ 
//       error: 'content missing' 
//     })
//   }

//   const note = new Note ({
//     content: body.content,
//     important: body.important || false,
//     id: generateId(),
//   })

//   note.save().then(result => {
//     console.log('note saved!')
//     response.json(result)
//   })
//     .catch(error => next(error))

// })

// // ROUTE RESURSSIN PÄIVITTÄMISTÄ VARTEN
// app.put('/api/notes/:id', (request, response, next) => {
//   const { content, important } = request.body
//   /*
//   const note = {
//     content: body.content,
//     important: body.important,
//   }*/

//   Note.findByIdAndUpdate(request.params.id, { content, important }, { new: true, runValidators: true, context: 'query' })
//     .then(updatedNote => {
//       response.json(updatedNote)
//     })
//     .catch(error => next(error))
// })

// // ROUTE RESURSSIN POISTOA VARTEN
// app.delete('/api/notes/:id', (request, response, next) => {
//   Note.findByIdAndDelete(request.params.id)
//     .then(result => {
//       response.status(204).end()
//     })
//     .catch(error => next(error))
// })

// VANHA 
/*
app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)

  // Jos poisto onnistuu eli poistettava muistiinpano on olemassa,
  // vastataan statuskoodilla 204 no content sillä mukaan ei lähetetä mitään dataa.
  response.status(204).end()
})*/



// VANHA HTTP KOODI
/*
const app = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(notes))
})


	 Viimeiset rivit sitovat muuttujaan app sijoitetun http-palvelimen
	 kuuntelemaan porttiin 3001 tulevia HTTP-pyyntöjä:
 
 
const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)


*/

// ENNEN KUIN VIRHEIDENKÄSITTELY SIIRRETTIIN OMAAN MODUULIINSA
/*
// Olemattomien osoitteiden käsittely
const unknownEndpoint = (request, response) => {
  console.log('unknownEndpoint')
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


// Virheidenkäsittelijä
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  console.log('errorHandler')

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)
*/

module.exports = app