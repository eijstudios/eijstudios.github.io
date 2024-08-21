// Select all anchor tags
var anchors = document.querySelectorAll('a');

// Loop through all anchor tags
for (var i = 0; i < anchors.length; i++) {
  // Add click event listener to each anchor tag
  anchors[i].addEventListener('click', function(event) {
    // Get the href attribute value
    var href = this.getAttribute('href');

    // If the href starts with '#', it's an internal link
    if (href.startsWith('#')) {
      // Prevent default action
      event.preventDefault();

      // Scroll to the element with the id from the href attribute value
      var id = href.substring(1);
      var element = document.getElementById(id);
      if (element) {
        element.scrollIntoView();
      }
    }
    // If the href does not start with '#', it's an external link
    // Do not prevent default action, allowing the link to be opened in a new tab
  });
}

//Get current year
document.getElementById("year").innerHTML = new Date().getFullYear();