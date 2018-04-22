var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new LibrarySchema object
// This is similar to a Sequelize model
var MovieSchema = new Schema({
  // `author` must be of type String
  title: String,
  genre: String,
  // `title` must be of type String
  person: String
});

// This creates our model from the above schema, using mongoose's model method
var Movie = mongoose.model("Movie", MovieSchema);

// Export the Book model
module.exports = Movie;
