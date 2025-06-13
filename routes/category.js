
const router = require('express').Router();


let Category = require('../models/category.model');
/*
 * @accept : 
    brodid :
 * @return : 
 */
router.route('/add').post((req, res) => {
  const newCategory = new Category({
    label  :  req.body.label,
    description  :  req.body.description || null,
  });

  newCategory.save()
  .then(category => res.json(category))
  .catch(err => res.status(400).json('Error: ' + err));
  
});

router.route('/').post((req, res) => {
  Category.find()
    .then(categories => res.json(categories))
      .catch(err => res.status(400).json('Error: ', err));  
});

module.exports = router;