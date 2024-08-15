// Select all anchor tags
var anchors = document.querySelectorAll('a');

// Loop through all anchor tags
for (var i = 0; i < anchors.length; i++) {
  // Add click event listener to each anchor tag
  anchors[i].addEventListener('click', function(event) {
    // Prevent default action
    event.preventDefault();

    // Get the href attribute value
    var href = this.getAttribute('href');

    // Scroll to the element with the id from the href attribute value
    if (href.startsWith('#')) {
      var id = href.substring(1);
      var element = document.getElementById(id);
      if (element) {
        element.scrollIntoView();
      }
    }
  });
}
