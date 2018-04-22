$(document).ready(() => {
    $('#searchForm').on('submit', (e) => {
      let searchText = $('#searchText').val();
      getMovies(searchText);
      e.preventDefault();
    });
  });
  
  function getMovies(searchText) {
    // Make a request to the URL 
    axios.get('https://api.themoviedb.org/3/search/movie?api_key=fa155f635119344d33fcb84fb807649b&query='+ searchText)
    .then(function (response) {
        var movies = response.data.results;
        console.log(movies);
        var output = '';
        $.each(movies, function(index, movie){
            output += '<div class="col-md-3">';
            output +=  '<div class="well text-center">';
            output +=  '<img src="http://image.tmdb.org/t/p/w185/'+ movie.poster_path +'">';
            output += '<h5>'+ movie.title +'</h5>';
            output +=  '<a onclick= movieSelected("'+searchText+' class="btn btn-primary" href="#movies")>Movie Details</a>';
            output += '</div>';
            output += '</div>';
        });

        $('#movies').html(output);

    })
    .catch(function (error) {
        console.log(error);
        console.log('something is going wrong');
    });
}
  
  function movieSelected(id){
    sessionStorage.setItem('movieId', id);
    window.location = 'movie.html';
    return false;
  }
  
  function getMovie(){
    let movieId = sessionStorage.getItem('movieId');
  
    axios.get('https://api.themoviedb.org/3/search/movie?api_key=fa155f635119344d33fcb84fb807649b&query='+ searchText)
      .then((response) => {
        console.log(response);
        var movie = response.data.results;
  
        var output = '';
          $.each(movies, function(index, movie){
            output += '<div class="row">';
            output += '<div class="col-md-4">';
            output += '<img src="${movie.poster}" class="thumbnail">';
            output += '</div>';
            output += '<div class="col-md-8">';
            output += '<h2>${movie.title}</h2>';
            output += '<ul class="list-group">';
            output += '<li class="list-group-item"><strong>Genre:</strong> ${movie.Genre}</li>';
            output += '<li class="list-group-item"><strong>Released:</strong> ${movie.Released}</li>';
            output += '<li class="list-group-item"><strong>Rated:</strong> ${movie.Rated}</li>';
            output += ' <li class="list-group-item"><strong>IMDB Rating:</strong> ${movie.imdbRating}</li>';
            output += '<li class="list-group-item"><strong>Director:</strong> ${movie.Director}</li>';
            output += '<li class="list-group-item"><strong>Writer:</strong> ${movie.Writer}</li>';
            output += '<li class="list-group-item"><strong>Actors:</strong> ${movie.Actors}</li>';
            output += '</ul>';
            output += '</div>';
            output += '</div>';
            output += '<div class="row">';
            output += '<div class="well">';
            output += '<h3>Pyylot</h3>';
            output += '${movie.Plot}';
            output += '<hr>';
            output += '<a href="http://imdb.com/title/${movie.imdbID}" target="_blank" class="btn btn-primary">View IMDB</a>';
            output += '<a href="index.html" class="btn btn-default">Go Back To Search</a>';
            output += '</div>';
            output += '</div>';
        });
  
        $('#movies').html(output);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Loads results onto the page
function getResults() {
  // Empty any results currently on the page
  $("#results").empty();
  // Grab all of the current notes
  $.getJSON("/all", function(data) {
    // For each note...
    for (var i = 0; i < data.length; i++) {
      // ...populate #results with a p-tag that includes the note's title and object id
      $("#results").prepend("<p class='dataentry' data-id=" + data[i]._id + "><span class='dataTitle' data-id=" +
        data[i]._id + ">" + data[i].title + "</span><span class=deleter>X</span></p>");
    }
  });
}

// Runs the getResults function as soon as the script is executed
getResults();

// When the #makenew button is clicked
$(document).on("click", "#makenew", function() {
  // AJAX POST call to the submit route on the server
  // This will take the data from the form and send it to the server
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/submit",
    data: {
      title: $("#title").val(),
      note: $("#note").val(),
      created: Date.now()
    }
  })
  // If that API call succeeds, add the title and a delete button for the note to the page
    .then(function(data) {
    // Add the title and delete button to the #results section
      $("#results").prepend("<p class='dataentry' data-id=" + data._id + "><span class='dataTitle' data-id=" +
      data._id + ">" + data.title + "</span><span class=deleter>X</span></p>");
      // Clear the note and title inputs on the page
      $("#note").val("");
      $("#title").val("");
    }
    );
});

// When the #clearall button is pressed
$("#clearall").on("click", function() {
  // Make an AJAX GET request to delete the notes from the db
  $.ajax({
    type: "GET",
    dataType: "json",
    url: "/clearall",
    // On a successful call, clear the #results section
    success: function(response) {
      $("#results").empty();
    }
  });
});

// When user clicks the deleter button for a note
$(document).on("click", ".deleter", function() {
  // Save the p tag that encloses the button
  var selected = $(this).parent();
  // Make an AJAX GET request to delete the specific note
  // this uses the data-id of the p-tag, which is linked to the specific note
  $.ajax({
    type: "GET",
    url: "/delete/" + selected.attr("data-id"),

    // On successful call
    success: function(response) {
      // Remove the p-tag from the DOM
      selected.remove();
      // Clear the note and title inputs
      $("#note").val("");
      $("#title").val("");
      // Make sure the #actionbutton is submit (in case it's update)
      $("#actionbutton").html("<button id='makenew'>Submit</button>");
    }
  });
});

// When user click's on note title, show the note, and allow for updates
$(document).on("click", ".dataTitle", function() {
  // Grab the element
  var selected = $(this);
  // Make an ajax call to find the note
  // This uses the data-id of the p-tag, which is linked to the specific note
  $.ajax({
    type: "GET",
    url: "/find/" + selected.attr("data-id"),
    success: function(data) {
      // Fill the inputs with the data that the ajax call collected
      $("#note").val(data.note);
      $("#title").val(data.title);
      // Make the #actionbutton an update button, so user can
      // Update the note s/he chooses
      $("#actionbutton").html("<button id='updater' data-id='" + data._id + "'>Update</button>");
    }
  });
});

// When user click's update button, update the specific note
$(document).on("click", "#updater", function() {
  // Save the selected element
  var selected = $(this);
  // Make an AJAX POST request
  // This uses the data-id of the update button,
  // which is linked to the specific note title
  // that the user clicked before
  $.ajax({
    type: "POST",
    url: "/update/" + selected.attr("data-id"),
    dataType: "json",
    data: {
      title: $("#title").val(),
      note: $("#note").val()
    },
    // On successful call
    success: function(data) {
      // Clear the inputs
      $("#note").val("");
      $("#title").val("");
      // Revert action button to submit
      $("#actionbutton").html("<button id='makenew'>Submit</button>");
      // Grab the results from the db again, to populate the DOM
      getResults();
    }
  })
});