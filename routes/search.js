const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const searchController = require('../controller/search.js');



router.route('/')
    .get(wrapAsync(searchController.index));

router.route('/search')
    .post(upload.single('search[file]'), wrapAsync(searchController.searchIndex));
router.route('/image')    
    .post(upload.single('search[file]'), wrapAsync(searchController.imageSearch));


module.exports = router;