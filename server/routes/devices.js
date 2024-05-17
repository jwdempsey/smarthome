const router = require('express').Router()
const Types = require('../models/types');
const PubSub = require('../pubsub');

router.post('/devices', (req, res) => PubSub.request('post', req, res));
router.get('/devices', (req, res) => PubSub.request('get', req, res));
router.get('/devices/:manufacturer/:key', (req, res) => PubSub.request('getById', req, res));
router.get('/devices/types', async (_, res) => res.send(Types));

module.exports = router;