module.exports = function(app, passport, mongoose) {

    // const User = require('./models/User');
  const TestResult = require('./models/testResult');

  // const user = require('/models/User');

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================

    app.get('/profile', isLoggedIn, async (req, res) => {
        const userId = req.user._id;
        
        try {
            // Use .find() and .toArray() to get the result
            const results = await TestResult.find({ userId: userId }).limit(1)
            const testResult = results.length > 0 ? results[0] : null; // Get the first result or null if not found
    
            res.render('profile', { user: req.user, testResult: testResult });
        } catch (err) {
            console.error('Error fetching test result:', err);
            res.status(500).send('Error fetching test result');
        }
    });
    
    
    
    

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout(() => {
          console.log('User has logged out!')
        });
        res.redirect('/');
    });

// test routes ===============================================================



// test page
app.get('/test', isLoggedIn, async (req, res) => {
    try {
        const results = await TestResult.find({}).limit(1) // Limit to 1 document
        const result = results.length > 0 ? results[0] : null; // Getting the first result or null if not found

        res.render('test.ejs', {
            user: req.user,
            testResult: result
        });
    } catch (err) {
        console.error('Error fetching test result:', err);
        res.status(500).send("An error occurred while fetching the result.");
    }
});



  function calculateScore(answers) {
    console.log(answers) // returns an object
    const correctAnswers = ['A', 'C', 'A', 'B', 'B']; // correct answers
    let score = 0;

    // Converting answers object to an array of values
    const answersArray = Object.values(answers);
    
    // Comparing each answer with the correct one
    answersArray.forEach((answer, index) => {
        if (answer === correctAnswers[index]) {
            score++;
        }
    });

    return score;
}

  

// Submit test answers get the calculate score
app.post('/submitTest', isLoggedIn, async (req, res) => {
    const userId = req.user._id; 

    const answers = req.body; 

    const score = calculateScore(answers);

    const newTestResult = new TestResult({
        userId: userId,
        score: score,
        answers: [answers.q1, answers.q2, answers.q3, answers.q4, answers.q5], // Store the answers array in the document
        dateTaken: new Date()
    });

    newTestResult.save()
        .then(() => {
        res.redirect('/profile');
        })
        .catch(err => {
        console.error('Error saving test result:', err);
        res.status(500).send('Error saving test result');
        });
    });

// redoing the test
app.put('/redoTest/:id', isLoggedIn, async (req, res) => {
    const testId = req.params.id;
    const { q1, q2, q3, q4, q5 } = req.body;
    const answers = [q1, q2, q3, q4, q5];
    const Updatedscore = calculateScore(answers);

    try {
        console.log('Request Body:', req.body);
        console.log('Updating test:', { testId, answers, Updatedscore });

        // Check if document exists before updating
        const existingTest = await TestResult.findById(testId);
        if (!existingTest) {
            return res.status(404).send({ message: "Test result not found." });
        }

        console.log("Document exists!");

        const userId = req.user._id;

        const result = await TestResult.updateOne(
            { _id: testId },
            {
                $set: {
                    answers: answers, // Directly use the answers array
                    userId: mongoose.Types.ObjectId(userId), // Making suree userId is an ObjectId
                    score: Updatedscore,
                    dateTaken: new Date() // Using current date
                }
            }
        );

        console.log('Update result:', result); 

        if (result.nModified === 0) {
            console.error(`No documents matched the query or document already up-to-date`);
            return res.status(404).send({ message: 'Test result not found or no changes made.' });
        }

        console.log('Test updated successfully!');
        const updatedTestResult = await TestResult.findById(testId);

        console.log('Updated Test Result:', updatedTestResult);
        
        res.render('profile', {
            user: req.user, 
            testResult: updatedTestResult // Pass the updated test result to the profile.ejs
        });
    } catch (error) {
        console.error("Error updating test:", error);
        res.status(500).send({ message: "Error updating test" });
    }
});



app.delete('/deleteTest/:id', (req, res) => {
    const testId = req.params.id;
    console.log('Test result ID:', testId)

    TestResult.findByIdAndDelete(testId, (err, result) => {
        if (err) return res.status(500).send({ message: "Error deleting test" });
        if (!result) return res.status(404).send({ message: "Test not found" });
        res.redirect('/profile');
    });
});



// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        }); // User sees the response

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', { // looks in passport file , uses the user model on line 7, then look in user.js file (hash is here, you never want to store passwords in plain text. You always ant to hash it)
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages. Show the user why they failed
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) { 
    if (req.isAuthenticated()) // If authenticated return it
        return next(); // Function built into express

    res.redirect('/'); // If not redirect the user to the homepage
}
