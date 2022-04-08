// movie list where we insert movies info
const movieList = document.querySelector('.movie-list');
const theatres = document.querySelector('#theatres');

// create event listeners
document.addEventListener('DOMContentLoaded', fetchTheatres); // call function fetches theatres when document loads
theatres.addEventListener('change', fetchMovies); // call function fetchMovies when select is pressed



// show current day in format day/month/year and current time
showDateTimetoday();
setInterval(showDateTimetoday, 1000);
function showDateTimetoday(){
  var date = new Date();
  var day = date.getDate();
  var month = date.getMonth(); //January is 0, not 1
  var year = date.getFullYear();
  var currentdate = day+"/"+(month+1)+"/"+year;
  document.getElementById("currentdatetime").innerHTML = currentdate+' '+' '+ date.toLocaleTimeString();
}

//text amination
textAnimation();
function textAnimation() {
  let id = null;
  const elem = document.getElementById("texteanimate");   
  let pos = 150;
  clearInterval(id);
  id = setInterval(frame, 1);
  function frame() {
    if (pos == 500) {
      clearInterval(id);
    } else {
      pos++; 
      elem.style.top = pos + "-1px"; 
      elem.style.left = pos + "px"; 
      elem.style.top = "15px"; 
    }
  }
}

// fetch theatres
function fetchTheatres() {
  // create new object XMLHttpRequest
  var xmlhttp = new XMLHttpRequest();
  // url of request
  var url = "https://www.finnkino.fi/xml/TheatreAreas/";
  
  // GET request to url
  xmlhttp.open("GET", url, true);
  // send request
  xmlhttp.send();
  
  // action to do when document request is ready
  xmlhttp.onreadystatechange=function() {
    if(xmlhttp.readyState == 4 && xmlhttp.status==200) {
      // save response XML document to variable
      var xmlDoc = xmlhttp.responseXML;
      // fetch names and ids      
	  var theatreIds = xmlDoc.getElementsByTagName("ID");
      var theatreNames = xmlDoc.getElementsByTagName("Name");

      // create list of values of theatres
      for(var i = 0; i < theatreIds.length; i++) {
        // create new option in select list
        document.getElementById("theatres").innerHTML +=  '<option value = ' 
		                                                 + theatreIds[i].innerHTML + '>' + theatreNames[i].innerHTML + '</option>';
      }
    }
  }
}
// fetch movies by theatre id
function fetchMovies() {
  // clear search field
  document.getElementById("movieInput").value = '';
  // clear movie list
  movieList.innerHTML = ''; 
  // make div with id=movie-container visible
  document.getElementById('movie-container').style.display = "flex";
  // display search field and button
  document.getElementById('movieInput').style.display = "flex";
  document.getElementById('searchBtn').style.display = "inline";
  // assign click event to search button
  document.addEventListener('click',function(e){
      if(e.target && e.target.id == 'searchBtn'){
		  e.preventDefault();
          searchMovie(e);
      }
  });
  // get id from list of values
  var id = document.getElementById("theatres").value;
  // use id to fetch movies by theatre id
  var xmlhttp = new XMLHttpRequest();
  // request URL
  var url = "https://www.finnkino.fi/xml/Schedule/?area=";
  // GET request to url + theatre's id
  xmlhttp.open("GET", url + id, true); // use id to fetch movies by theatre id
  // send request
  xmlhttp.send();
  // action when requested xml document is ready
  xmlhttp.onreadystatechange=function() {
    if(xmlhttp.readyState == 4 && xmlhttp.status==200) {
      // save XML document to variable
      var xmlResponse = xmlhttp.responseXML;
      // process XML document into variables
      var titles = xmlResponse.getElementsByTagName('Title');
      var imgURLs = xmlResponse.getElementsByTagName('EventSmallImagePortrait');
	    var theatreAuditorium = xmlResponse.getElementsByTagName('TheatreAndAuditorium');
      var timeSchedule = xmlResponse.getElementsByTagName('dttmShowStart');
      var rating = xmlResponse.getElementsByTagName('RatingImageUrl');
      var contentDescriptors = xmlResponse.getElementsByTagName('ContentDescriptors');
      var duration = xmlResponse.getElementsByTagName('LengthInMinutes');
	  // go through xml entries and place them into table rows
      for(var i = 0; i < titles.length; i++) {
        var imgURL = '<img src="' + imgURLs[i].innerHTML + '">';
        // movie title
        var title = titles[i].innerHTML;
		// auditorium
		    var auditorium = theatreAuditorium[i].innerHTML;
        // show time
        var schedule = timeSchedule[i].innerHTML;
        // rating
        var ratingIMG = '<img src="' + rating[i].innerHTML + '" onerror="imgError(this);" width="30px" height="30px">';
       // movie duration
        var movieDuration = duration[i].innerHTML;

        // find out date, year, month, time  		
		    var year = schedule.slice(0,4);
        var month = schedule.slice(5,7);
        var date = schedule.slice(8, 10);
        var time = schedule.slice(11, 16);

        var contentDescriptor = contentDescriptors[i].getElementsByTagName('ContentDescriptor');
        var descriptionImages = '';
        for(var j = 0; j < contentDescriptor.length; j++) {
          descriptionImages += '<img src="' + contentDescriptor[j].getElementsByTagName('ImageURL')[0].innerHTML + '">';
        }  
        if (descriptionImages != ''){	// description images are not empty	
		            var value = '<table><tr><td>'+ imgURL 
		                      + '</td><td>' + title + '<br/>' 
							  + date + "." + month+ "." + year + " " + time + '<br/>' 
							  + "Duration " + movieDuration + " minutes <br/>" 
							  + "Auditorium " + auditorium + '<br/>' 
							  + "Rating " + ratingIMG + '<br/>'
							  + "Content Description " + descriptionImages + '<br/>' + '</td></tr></table>';
	    	} 
        else { // description images are empty
		            var value = '<table><tr><td>'+ imgURL 
		                      + '</td><td>' + title + '<br/>' 
							  + date + "." + month+ "." + year + " " + time + '<br/>' 
							  + "Duration " + movieDuration + " minutes <br/>" 
							  + "Auditorium " + auditorium + '<br/>' 
							  + "Rating " + ratingIMG + '<br/>' + '</td></tr></table>';			
		    }
		//create div element
        const itemDiv = document.createElement('div');
		// add to div class 'item'
        itemDiv.classList.add('item');           
        // create li element
        const newEntry = document.createElement('li');
		// place table with movie info  into li element innerText
        newEntry.innerHTML = value;
		// add class 'list-item' to li element
        newEntry.classList.add('list-item');
		// append li element to div element
        itemDiv.appendChild(newEntry);	
		// append div element to element UL with class 'movie-list'
	    	movieList.appendChild(itemDiv);	
      }
    }
  }
}
// search in the list of movies for a specific string given in input field
function searchMovie(event) {
	// to prevent form from submitting and refreshing page
	event.preventDefault();
	// element ul child nodes
    const items = movieList.childNodes;
    var found = 0;
    // find input field
    var input = document.getElementById("movieInput");
	// search input
    var searchString = input.value.toUpperCase();
	// filter items
    items.forEach(function (item) {
        if (item.nodeName === '#text') {
            // do nothing
        } 
        else {	
            if (item.innerText.toUpperCase().indexOf(searchString) > -1) {
                item.style.display = "flex";
                found = 1;
            } else {
		        item.style.display = "none";
            }
	    	}
    });
    //if (found === 0){ document.getElementById('movie-container').innerText = "No films found for search string: " + searchString;}
}
// function to replace not found images with predifined image
function imgError(image) {
    image.onerror = "";
    image.src = "./noimage.gif";
    return true;
}