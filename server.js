
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');

var fs = require('fs'); //file system so we can access to our computer file system
var blogPosts = require('./blogPosts.json'); //and create blogPost.json 

//the file blogPost.json: (can't add comments in JSON)
//it's a way of storing data
//it's used to sending data over the web
//move data from the server to the web
//handlebars allows you put javascript in your html

var app = express();

// Register '.handlebars' extension with exphbs
app.engine('handlebars', exphbs());
// Set our default template engine to "handlebars"
app.set('view engine', 'handlebars');

// Path to our public directory
app.use(express.static('public'));
//It tells to express that there is a public folder

app.use(bodyParser.urlencoded({ extended: false }));

//
function saveJSONToFile(filename, json) {
  // Convert the blogPosts object into a string and then save it to file
  fs.writeFile(filename, JSON.stringify(json, null, '\t') + '\n', function(err) {
    // If there is an error let us know
    // otherwise give us a success message
    if (err) {
      throw err;
    } else {
      console.log('It\'s saved!');
    }
  });//THIS ALL ALLOWS YOU SAVE A FILE IN YOUR COMPUTER
}

function savePost(id, object, data) {
  // Update object with new data
  object[id] = data;
  // Save the updated object to file
  saveJSONToFile('blogPosts.json', object);
}



// Create a list of blog posts formatted
// in a way that's usable in our templates
// var blogPosts = {
//   "my-first-webpage": {
//     "title": "My first webpage",
//     "excerpt": "I've taken a course at Code at Uni and created my own personal website with HTML and CSS.",
//     "content": "\
//     <p>My first paragraph as well!</p>\
//     <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In vehicula ante nec neque lobortis, fringilla convallis elit dignissim.</p>\
//     "
//   },
//   "hello-world": {
//     "title": "Hello World",
//     "excerpt": "This is the start of my online journal. I will take about my journey in learning how to code!",
//     "content": "\
//     <p>Hello World this is a paragraph.</p>\
//     <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In vehicula ante nec neque lobortis, fringilla convallis elit dignissim.</p>\
//     "
//   },
//   "simplification": {
//     "title": "3D simplification",
//     "excerpt": "Here is the first step of 3D Generalisation.",
//     "content": "\
//     <p>First step.</p>\
//     <p>The features and attributes that are not relevant will be removed. The number of nodes will be reduced.</p>\
//     "
//   },
//    "aggregation": {
//     "title": "3D aggregation",
//     "excerpt": "Here is the second step of 3D Generalisation.",
//     "content": "\
//     <p>Second step.</p>\
//     <p>Elements withing a short distance with similar characteristics will be merged.</p>\
//     "
//   },
// };

//HTTP METHODS
// GET  (from the client)(to get the entries)
// Request comes from the client
// Response is what I send back
//if we hadn't EXPRESS we wouldn't be able to use GET.
app.get('/',function(request, response){
	response.render('home');
});

// Contact
app.get('/contact', function (req, res) {
  res.render('contact');
});

app.get('/create-post',function(req,res){
	res.render('create-post');
});


app.post('/create-post',function(req,res){
	var title = req.body.title; //from create-post.handlebars, the form, name='title' line31
	var excerpt = req.body.excerpt;
	var content = req.body.content;

	var formBody={
		title: title,
		excerpt: excerpt,
		content: content
	};

	if (!formBody.title) {
	    return res.render('create-post', {
	      error: true,
	      message: 'The title is required!',
	      missingTitle: true,
	      formBody,
	    });
	 }

	 var timestamp  = Date.now(); //miliseconds to get a unique id
	 var postId = timestamp;
	
	// Save new post to file
	savePost(postId, blogPosts, {
	  id: postId,
	  title: formBody.title,
	  excerpt: formBody.excerpt,
	  content: formBody.content,
	});
	
	res.render('create-post', {
	  success: true,
	  message: 'New post successfully created!',
	  postId,
	});
});

app.get('/blog', function(req,res){
	var listOfPosts = [];//an empty array of lists of posts
	
	//console.log(Object.keys(blogPosts)); //[ 'my-first-webpage', 'hello-world' ]
	Object.keys(blogPosts).forEach(function(postId){
		console.log(postId);
		//my-first-webpage FOR THE FIRST LOOP
		//hello-world FOR THE SECOND LOOP	
		var post = blogPosts [postId]
;		post.id=postId;//added an ID

		listOfPosts.push(post); //Add it to the end
	})
	//res.send('blog!'); //To check that it works!
	res.render('blog',{
		posts: listOfPosts,
	});
	//Render is when you render a template
	//send is to send something,send text

});

//we send an individual post id at the root :postId
app.get('/blog/:postId',function(req,res){
	//console.log(req.params.postId);
	var post = blogPosts[req.params.postId];
	if (post){
		//res.send(post);
		res.render('post', post);
	} else{
		res.send('404! not found');
	}
 });
//asign to objects

// var person = {
// 	name: 'paul',

// }
// person['hair']='brown/grey';

// app.get('/profile',function(req, res){
// 	res.send('My name is Esti!');
// });



// Handle the contact form submission
app.post('/contact', function(req, res) {
  
	 var formBody = {
	    'name': req.body.name,
	    'email': req.body.email,
	    'subject': req.body.subject,
	    'message': req.body.message,
	  };

	var missingName = (formBody.name === '');
	var missingEmail = (formBody.email === '');
	var missingMessage = (formBody.message === '');
    
    console.log(formBody);
	

	if (missingName || missingEmail || missingMessage) {
	  return res.render('contact', {
	    error: true,
	    message: 'Some fields are missing.',
	    formBody: formBody,
	    missingName: missingName,
	    missingEmail: missingEmail,
	    missingMessage: missingMessage,
	  });
	}
	else{
		// res.render('contact', {
	  	//   formBody,
	  	// });
		// res.render('contact', {
		//   success: true,
		//   message: 'Your message has been successfully sent!',
		// });

		var mailgun = require('mailgun-js')({ apiKey: 'key-c79c797e8e7a9e2c5d71a1e31b232dbf', domain: 'sandboxf20a45b323b646c7986d736922d86ca9.mailgun.org' });

		// Email options
		var emailOptions = {
		  from: formBody.name + ' <' + formBody.email + '>',
		  to: 'estibaliz.herrero.17@ucl.ac.uk',
		  subject: 'Website contact form - ' + formBody.subject,
		  text: formBody.message,
		};

		// Try send the email
		mailgun.messages().send(emailOptions, function (error, response) {
		  if (error) {
		    res.render('contact', {
		      error: true,
		      message: 'The message was not sent. Please try again.',
		      formBody: formBody,
		    });
		  } else {
		    res.render('contact', {
		      success: true,
		      message: 'Your message has been successfully sent!',
		    });
		  }
		});
	}
});

// Edit a blog post
app.get('/edit-post/:post_id', function(req, res) {
  var postId = req.params['post_id'];
  var post = blogPosts[postId];

  if (!post) {
    res.send('Not found');
  } else {
    res.render('edit-post', {
      formBody: post,
      postId,
    });
  }
});

// Handle editing a blog post
app.post('/edit-post/:post_id', function(req, res) {
  var postId = req.params['post_id'];
  var post = blogPosts[postId];

  var formBody = {
    'title': req.body.title,
    'excerpt': req.body.excerpt,
    'content': req.body.content,
  };

  if (!formBody.title) {
    return res.render('edit-post', {
      error: true,
      message: 'The title is required!',
      missingTitle: true,
      postId,
      formBody,
    });
  }

  var newPost = {
    id: postId,
    title: formBody.title,
    excerpt: formBody.excerpt,
    content: formBody.content,
  };

  // Save new post to file
  savePost(postId, blogPosts, newPost);

  res.render('edit-post', {
    success: true,
    message: 'Post successfully saved!',
    postId,
    formBody: newPost,
  });
});

//app is now listening for requests
app.listen(5000, function () {
  console.log('Lesson 1 listening on port 5000!');
});
//check it into Chrome into the link:
//http://localchost:5000/home
// POST (To send something)
