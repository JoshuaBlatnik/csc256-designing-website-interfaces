// Create an empty array to store movie titles
const movieList = [];
// Function to add a movie to the list
function addMovie() {
  // Get the input element
  const input = document.getElementById("movieInput");
  // Get the trimmed value from the input field
  const title = input.value.trim();
  // If the input is not empty, add it to the list
  if (title) {
    movieList.push(title); // Add movie to array
    input.value = ""; // Clear input field
  }
}
// Function to display the sorted list of movies
function displayMovies() {
  // Get the div where the movie list will be shown
  const display = document.getElementById("movieListDisplay");
  // Sort a copy of the list alphabetically
  const sorted = [...movieList].sort((a, b) => a.localeCompare(b));
  // Convert sorted movies into HTML paragraphs and display them
  display.innerHTML = sorted.map(movie => `<p>${movie}</p>`).join("");
}
// Function to reset the list and clear the display
function resetMovies() {
  movieList.length = 0; // Clear the array
  document.getElementById("movieInput").value = ""; // Clear input box
  document.getElementById("movieListDisplay").innerHTML = ""; // Clear list display
}