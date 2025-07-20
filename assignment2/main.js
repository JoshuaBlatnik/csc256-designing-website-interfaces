// Define an object to store student information
const student = {
  name: "Joshua Blatnik",                      // Student's name
  major: "Advancing Computer Science",         // Student's major
  email: "josblatn@uat.edu",                   // Student's email address
  gradDate: "May 2026"                         // Student's expected graduation date
};

// Insert student name into the element with ID "name"
document.getElementById("name").textContent = student.name;

// Insert student major into the element with ID "major"
document.getElementById("major").textContent = "Major: " + student.major;

// Insert student email into the element with ID "email"
document.getElementById("email").textContent = "Email: " + student.email;

// Insert student graduation date into the element with ID "gradDate"
document.getElementById("gradDate").textContent = "Expected Graduation: " + student.gradDate;

// Define an array of slideshow images with their source file and caption text
const slides = [
  { src: "qgcomputer.png", caption: "Programming Expertise" },       // Slide 1: Programming
  { src: "qghvac.png", caption: "HVAC Certified" },                  // Slide 2: HVAC
  { src: "qgdiesel.png", caption: "Diesel Mechanic Skills" },        // Slide 3: Diesel
  { src: "qgdelivery.png", caption: "Gas Systems Specialist" }       // Slide 4: Gas Specialist
];

// Initialize index to track the current slide number
let index = 0;

// Get the slideshow image element by ID
const slideImg = document.getElementById("slide");

// Get the caption element by ID
const caption = document.getElementById("captionText");

// Function to display the slide at index i
function showSlide(i) {
  slideImg.src = slides[i].src;                // Update the image source
  caption.textContent = slides[i].caption;     // Update the caption text
}

// Automatically cycle to the next slide every 3 seconds (3000ms)
setInterval(() => {
  index = (index + 1) % slides.length;         // Increment index and wrap around if needed
  showSlide(index);                            // Show the new slide
}, 3000);

// Show the first slide immediately on page load
showSlide(index);