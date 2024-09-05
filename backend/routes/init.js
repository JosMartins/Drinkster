const express = require('express');
const router = express.Router();

//GET home page
router.get('/',(req,res) => {
    res.send('Drinkster: A questions game paired with drinking!');
});

module.exports = router;