============== Quick Start Guide for Authorizer App ==============

--- INSTRUCCTIONS: How to Run the Project ---

*Prerequisites*

To run this application, you will need the following software installed on your system:

-Node.js (version 14.x or higher recommended)
-npm (usually comes with Node.js)
-A modern web browser (Chrome, Firefox, Safari, or Edge)

*Installing Dependencies*

Before launching the application, you need to install the required dependencies. 

Open a terminal in your project directory and run the following command:

npm install
npm install express

*Starting the Application*

To start the application, execute the following command in the terminal:

node app.js

*Accessing the Application*

Once the application is running, you can access it through any web browser.

Simply type http://localhost:3000 into your browser’s address bar.

============== Technical and Architectural Decisions ==============

*Technology Choices*

Node.js and Express: I chose Node.js for its efficiency in non-blocking I/O and Express to simplify route configuration, which also simplifies server execution.

JavaScript Across the Stack: A single language in both frontend and backend for better coherence and code reuse.

HTML/CSS: To ensure compatibility and accessibility across all browsers. I am also familiar with using it extensively for client/server applications.



*System Architecture*

Client-Server Model: I used this model because it is common and required for this system, plus it is easier to maintain.

RESTful API: Uses APIs that provide a clear interface between the client and the server, allowing each part to evolve independently.

Middleware in Express: Manages the application's state and user sessions securely and efficiently.




