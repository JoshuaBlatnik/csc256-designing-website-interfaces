// Define the function that runs when the "Start Game" button is clicked
function submitForm() {
  // Get the value from the input field with ID "username"
  const username = document.getElementById("username").value;
  // Get the value from the input field with ID "weapons"
  const weapons = document.getElementById("weapons").value;
  // Get the value from the input field with ID "health"
  const health = document.getElementById("health").value;
  // Get the value from the input field with ID "points"
  const points = document.getElementById("points").value;
  // Combine all values into a single formatted string with labels and line breaks
  const result =
    `User Name:\t${username}\n` +
    `Weapons:\t${weapons}\n` +
    `Health/Damage:\t${health}\n` +
    `Point Total:\t${points}`;
  // Get the output display element by its ID "output"
  const output = document.getElementById("output");
  // Set the text of the output element to the formatted result
  output.textContent = result;
  // Make the output element visible by changing its opacity to 1
  output.style.opacity = "1";
}