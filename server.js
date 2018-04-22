var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// var mongojs = require("mongojs");

var PORT = 3000;

// Require all models
var db = require("./models");

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// By default mongoose uses callbacks for async queries, we're setting it to use promises (.then syntax) instead
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/populate", {
  // useMongoClient: true
});

// When the server starts, create and save a new WatchList document to the db
// The "unique" rule in the WatchList model's schema will prevent duplicate libraries from being added to the server
db.WatchList.create({ name: "Movie WatchList" })
  .then(function(dbWatchList) {
    // If saved successfully, print the new WatchList document to the console
    console.log(dbWatchList);
  })
  .catch(function(err) {
    // If an error occurs, print it to the console
    console.log(err.message);
  });

// Routes

// POST route for saving a new Movie to the db and associating it with a WatchList
app.post("/submit", function(req, res) {
  // Create a new Movie in the database
  db.Movie.create(req.body)
    .then(function(dbMovie) {
      // If a Movie was created successfully, find one WatchList (there's only one) and push the new Movie's _id to the WatchList's `Movies` array
      // { new: true } tells the query that we want it to return the updated WatchList -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.WatchList.findOneAndUpdate({}, { $push: { movies: dbMovie._id } }, { new: true });
    })
    .then(function(dbWatchList) {
      // If the WatchList was updated successfully, send it back to the client
      res.json(dbWatchList);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Route for getting all movies from the db
app.get("/movies", function(req, res) {
  // Using our movie model, "find" every movie in our db
  db.Movie.find({})
    .then(function(dbMovie) {
      // If any Movies are found, send them to the client
      res.json(dbMovie);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Route for getting all libraries from the db
app.get("/watchlist", function(req, res) {
  // Using our WatchList model, "find" every WatchList in our db
  db.WatchList.find({})
    .then(function(dbWatchList) {
      // If any Libraries are found, send them to the client
      res.json(dbWatchList);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Route to see what WatchList looks like WITH populating
app.get("/populated", function(req, res) {
  // Using our WatchList model, "find" every WatchList in our db and populate them with any associated movies
  db.WatchList.find({})
    // Specify that we want to populate the retrieved libraries with any associated movies
    .populate("movies")
    .then(function(dbWatchList) {
      // If any Libraries are found, send them to the client with any associated Movies
      res.json(dbWatchList);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// // Routes
// // ======

// // Simple index route
// app.get("/", function(req, res) {
//   res.send(index.html);
// });

// // Handle form submission, save submission to mongo
// app.post("/submit", function(req, res) {
//   console.log(req.body);
//   // Insert the note into the notes collection
//   db.movies.insert(req.body, function(error, saved) {
//     // Log any errors
//     if (error) {
//       console.log(error);
//     }
//     else {
//       // Otherwise, send the note back to the browser
//       // This will fire off the success function of the ajax request
//       res.send(saved);
//     }
//   });
// });

// // Retrieve results from mongo
// app.get("/all", function(req, res) {
//   // Find all notes in the notes collection
//   db.movies.find({}, function(error, found) {
//     // Log any errors
//     if (error) {
//       console.log(error);
//     }
//     else {
//       // Otherwise, send json of the notes back to user
//       // This will fire off the success function of the ajax request
//       res.json(found);
//     }
//   })
// });

// // Select just one note by an id
// app.get("/find/:id", function(req, res) {
//   // When searching by an id, the id needs to be passed in
//   // as (mongojs.ObjectId(IDYOUWANTTOFIND))

//   // Find just one result in the notes collection
//   db.movies.findOne(
//     {
//       // Using the id in the url
//       _id: mongojs.ObjectId(req.params.id)
//     },
//     function(error, found) {
//       // log any errors
//       if (error) {
//         console.log(error);
//         res.send(error);
//       }
//       else {
//         // Otherwise, send the note to the browser
//         // This will fire off the success function of the ajax request
//         console.log(found);
//         res.send(found);
//       }
//     }
//   );
// });

// // Update just one note by an id
// app.post("/update/:id", function(req, res) {
//   // When searching by an id, the id needs to be passed in
//   // as (mongojs.ObjectId(IDYOUWANTTOFIND))

//   // Update the note that matches the object id
//   db.movies.update(
//     {
//       _id: mongojs.ObjectId(req.params.id)
//     },
//     {
//       // Set the title, note and modified parameters
//       // sent in the req's body.
//       $set: {
//         title: req.body.title,
//         movie: req.body.movie,
//         modified: Date.now()
//       }
//     },
//     function(error, edited) {
//       // Log any errors from mongojs
//       if (error) {
//         console.log(error);
//         res.send(error);
//       }
//       else {
//         // Otherwise, send the mongojs response to the browser
//         // This will fire off the success function of the ajax request
//         console.log(edited);
//         res.send(edited);
//       }
//     }
//   );
// });

// // Delete One from the DB
// app.get("/delete/:id", function(req, res) {
//   // Remove a note using the objectID
//   db.movies.remove(
//     {
//       _id: mongojs.ObjectID(req.params.id)
//     },
//     function(error, removed) {
//       // Log any errors from mongojs
//       if (error) {
//         console.log(error);
//         res.send(error);
//       }
//       else {
//         // Otherwise, send the mongojs response to the browser
//         // This will fire off the success function of the ajax request
//         console.log(removed);
//         res.send(removed);
//       }
//     }
//   );
// });

// // Clear the DB
// app.get("/clearall", function(req, res) {
//   // Remove every note from the notes collection
//   db.movies.remove({}, function(error, response) {
//     // Log any errors to the console
//     if (error) {
//       console.log(error);
//       res.send(error);
//     }
//     else {
//       // Otherwise, send the mongojs response to the browser
//       // This will fire off the success function of the ajax request
//       console.log(response);
//       res.send(response);
//     }
//   });
// });

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
