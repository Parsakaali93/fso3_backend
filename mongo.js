const config = require('./utils/config')

const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://misuel:${password}@cluster0.lcfyeas.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)


const note = new Note({
  content: 'Test note 2',
  important: true,
})

note.save().then(result => {
  console.log('note saved!')
  mongoose.connection.close()
})

// GET ALL NOTES
/*
Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})*/

// Voisimme hakea esim. ainoastaan tärkeät muistiinpanot seuraavasti:
/*
Note.find({ important: true }).then(result => {
  // ...
})*/