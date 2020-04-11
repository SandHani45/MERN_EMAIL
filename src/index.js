
const { port } = require("./config/vars");
const app = require("./config/express");
const mongoose = require("./config/mongoose");

// open mongoose connection
mongoose.connect();
// @route  GET api/users/test
// @desc   Test User router
// @access Public
// listen to requests
app.listen(port, () => console.log(`server running ${port}`));

/**
 * Exports express
 * @public
 */
module.exports = app;