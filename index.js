
const express = require('express')
const app = express()
const cors = require('cors')
/*Jotta pääsisimme POST-pyynnön mukana lähetettyyn dataan helposti 
käsiksi, tarvitsemme Expressin tarjoaman json-parserin apua. */
app.use(express.json())
app.use(cors())

/* Jotta saamme Expressin näyttämään staattista sisältöä eli sivun index.html
 ja sen lataaman JavaScriptin ym. tarvitsemme Expressiin sisäänrakennettua middlewarea static. */
app.use(express.static('dist'))

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the ",
    important: true
  },
  {
    id: 4,
    content: "Neljas Nootti ",
    important: true
  }
]

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


const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}

// ROUTE RESURSSIN VASTAANOTTOA VARTEN
app.post('/api/notes', (request, response) => {
  const body = request.body

  // We require the content field to not be empty
  if (!body.content) {
    // Return is important, otherwise the function will
    // continue and post the note into the database
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  const note = {
    content: body.content,
    important: body.important || false,
    id: generateId(),
  }

  notes = notes.concat(note)

  response.json(note)
})

// ROUTE RESURSSIN POISTOA VARTEN
app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)

  // Jos poisto onnistuu eli poistettava muistiinpano on olemassa,
  // vastataan statuskoodilla 204 no content sillä mukaan ei lähetetä mitään dataa.
  response.status(204).end()
})

// Käsittelee sovelluksen juureen tulevia pyyntöjä
app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

// Käsittelee polkuun /api/notes tulevia pyyntöjä
app.get('/api/notes', (req, res) => {
  // huomaa että ei tarvitse stringify-metodia kuten pelkässä Nodessa
  res.json(notes)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

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