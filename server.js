require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const POKEDEX = require('./pokedex.json');

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganSetting));

app.use(helmet());

app.use(cors());

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' });
    }
    next();
});

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`];

function handleGetTypes(req, res) {
    res.json(validTypes);
}

app.get('/types', handleGetTypes);

function handleGetPokemon(req, res) {
    const { name = "", type } = req.query;

    if (type) {
        if (!validTypes.includes(type)) {
            return res
                .status(400)
                .send('Type must be one of Bug, Dark, Dragon, Electric, Fairy, Fighting, Fire, Flying, Ghost, Grass, Ground, Ice, Normal, Poison, Psychic, Rock, Steel, Water');
        }
    }

    let results = POKEDEX.pokemon.filter(pokemon => 
        pokemon
            .name
            .toLowerCase()
            .includes(name.toLowerCase())
    );

    if (type) {
        results = results.filter(pokemon => {
            return pokemon.type.includes(type)
        })
    }

    res.send(results)
}

app.get('/pokemon', handleGetPokemon);

app.use((error, req, res, next) => {
    let response;
    if (process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        response = { error }
    }
    res.status(500).json(response)
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
});