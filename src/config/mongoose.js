const mongoose = require("mongoose");
const { mongo, env } = require("./vars");
mongoose.set('useFindAndModify', false);
// set mongoose Promise to Bluebird
mongoose.Promise = Promise;

// Exit application on error
mongoose.connection.on("error", err => {
  console.log(`MongoDB connection error: ${err}`)
  process.exit(-1);
});

// print mongoose logs in dev env
if (env === "development") {
  mongoose.set("debug", true);
}

/**
 * Connect to mongo db
 *
 * @returns {object} Mongoose connection
 * @public
 */
exports.connect = () => {
  mongoose.connect(mongo.uri, {
    keepAlive: 1,
    useNewUrlParser: true
  })
  .then(() => console.log("mongodb conneneted "))
  .catch(err => console.log(err));
  return mongoose.connection;
};