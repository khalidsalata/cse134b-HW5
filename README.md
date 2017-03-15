# cse134b-HW5
Final Push, Art You Find In Bathrooms

Demo link: 
<http://cse-134b-hw4.firebaseapp.com>

Official write-up:
<https://docs.google.com/document/d/16RFgrEp0TyqaXmxfeNvdKPhRo6X5TPtfs0fY2n-D7Ys/edit?usp=sharing>

## Features
1. Firebase CRUD functions: The website uses firebase to store and display image data. Firebase performs real-time updates to the model based on the usage of the website. We are specifically using Firebase’s real-time database and storage functionalities for our application.
2. Authentication: While the content of AYFIB is viewable by anyone who enters the site, only authorized users have the power to create, update, and delete information.
3. Single Page Application with Bootstrap Modals: The CRUD functions are presented in bootstrap modals to deliver the feel of a multi-page application 
4. System State with Snackbars: Timed notifications from the page to let the user know that their action was successful, or of an important update
5. Real-time without the strain: Making a page that adds content and relentlessly updates in real-time is intrusive, places unappreciated strain on the network, and can comprise a user experience. The website will make it known that new content is available, but the choice to load more images and make updates is entirely up to the user.
6. Device-specific view: The website will stack content and display reduced-resolution images when the site is accessed from a mobile device
7. Image size reduction for mobile viewing: Every time a new art piece is added a full-resolution image and a 300x300 copy are both sent to firebase storage. The smaller copy is typically on the order of 5 times lighter in file size than the original, and is perfect for weaker devices/connections.
8. We use Manifest as a way to make our web app valid with the standards of progressive web applications. Users are able to add a bookmark to their home screen with a distinguished icon to launch our app directly from their device home screen.

## Code Architecture
* index.html- includes hidden modals and empty snackbar div; minified code
* index-unpackage.html- un-minified code for readability
* manifest.json- Manifest used for building PWA
* style.css- un-minified custom styling
* style.min.css- minified styles
* script.js- contains all custom JavaScript code
* script.min.js- minified JavaScript code

## Ways We’ve Optimized Our Application
1. Minifying our code
2. Removing our background header image for faster first view
3. Creating lighter, reduced resolution images for mobile users to view
4. Included Manifest to make a more seamless progressive web app

## Looking Forward, Some More Todo’s Beyond This Class:
1. TODO: Add a Service Worker for a better user experience & lightning fast page loads
2. TODO: Enforce chronological ordering of images on the home screen
3. TODO: Find better way to reduce image resolution without losing quality
4. TODO: Use client-side compression/decompression of images to reduce network utilization
5. TODO: More attractive user experience without performance drawback

