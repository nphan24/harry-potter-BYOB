const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const db = require('knex')(configuration);

app.set('port', process.env.PORT || 3000);
app.locals.title = 'Potter DB';

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.get('/api/v1/houses', (request, response) => {
  db('houses').select()
    .then((houses) => {
      response.status(200).json(houses)
    })
    .catch(err => {
      response.status(500).json({error: err, message: 'Failed to GET houses'})
    })
});

app.get('/api/v1/houses/:id', (request, response) => {
  db('houses').where('id', request.params.id).select()
    .then((houses) => {
      response.status(200).json(houses)
    })
    .catch(err => {
      response.status(404).json({error: err, message:'House Not Found, Invalid Id'})
    })
})

app.post('/api/v1/houses', (request, response) => {
  const house = request.body;

  if (!house.name 
    && !house.founder
    && !house.house_head 
    && !house.colors 
    && !house.ghost 
    && !house.common_room){
    return response.status(406).json({message: 'Invalid house supplied, valid house must have name, founder, house_head, colors, ghost, and common_room'})
  } else {
    db('houses').insert(house, 'id')
    .then(house => {
      response.status(201).json({id: house[0]})
    })
    .catch(err => {
      response.status(500).json({error: err, message: 'Failed to POST house. OOPPS!'})
    });
  }
});

app.delete('/api/v1/houses', (request, response) => {
  const id = request.body.id;

  db('houses').where('id', id).del()
  .then(houses => {
    response.status(200).json({message: 'House deleted'})
  })
  .catch(err => {
    response.status(418).json({message: 'Unable to delete house'})
  })
})

app.post('/api/v1/characters', (request, response) => {
  const character = request.body;
  if (!character.name && !character.house_id){
    return response.status(406).json({message: 'Invalid character supplied, valid character must have name and house id'})
  } else {
    const newCharacter = {
      name: character.name,
      birthday: character.birthday || 'NA',
      patronus: character.patronus || 'NA',
      parents: character.parents || 'NA',
      skills: character.skills || 'NA',
      hobbies: character.hobbies || 'NA',
      blood: character.blood || 'NA',
      wand: character.wand || 'NA',
      image: character.image,
      house: character.house || 'NA',
      house_id: character.house_id
    }
    db('characters').insert(newCharacter, 'id')
    .then(characterId => {
      response.status(201).json({id: characterId[0]})
    })
    .catch(err => {
      response.status(500).json({error: err, message: 'Failed to POST character. OOPPS!'})
    });
  }
});

app.get('/api/v1/characters', (request, response) => {
  db('characters').select()
    .then((characters) => {
      response.status(200).json(characters)
    })
    .catch(err => {
      response.status(500).json({error: err, message: 'Failed to GET characters'})
    });
});

app.get('/api/v1/characters/:house_id', (request, response) => {
  db('characters').where('house_id', request.params.house_id).select()
   .then((characters) => {
     response.status(200).json(characters)
   })
   .catch(err => {
      response.status(500).json({error: err, message: 'Character Not Found, Invalid Id'})
   })
});

app.delete('/api/v1/characters', (request, response) => {
  const id = request.body.id;
  db('characters').where('id', id).del()
    .then(characters => {
      response.status(200).json({message: 'Character removed'})
    })
    .catch(err => {
      response.status(404).json({message: "Character not found, unable to delete"})
    });
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

module.exports = { app };