//dependencies


var express = require('express');
var app = express();

var path = require('path');
var session = require('express-session');

var bodyParser= require('body-parser');
const { urlencoded } = require('body-parser');

var mysql = require('mysql');

app.use('./public',express.static("public"));

var urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(bodyParser.json()); 

app.use(express.static(path.join(__dirname,'views')));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname,'views'));
app.use(bodyParser.urlencoded({ extended: false }));

//session init

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

//db init
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'hello_mysql',
	database : 'faculty_db'
});

connection.connect((error) => {
    if(error){
        console.log(error);
    }
    else{
        console.log('Database Connected Sucessfully!');
    }
});

//paths
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname,'/views/login.html'));
});

app.get('/adminlogin',(req,res) => {
    res.sendFile(path.join(__dirname,'/views/adminlogin.html'));
});

app.get('/deanlogin',(req,res) => {
    res.sendFile(path.join(__dirname,'/views/deanlogin.html'));
});

app.get('/faq',(req,res) => {
    res.sendFile(path.join(__dirname,'/views/faq.html'));
});

app.get('/about', (req, res) =>{
    res.sendFile(path.join(__dirname,'/views/about.html'));
})

app.get('/facultydash', (req,res) => {
    if (req.session.loggedin) {
		res.sendFile(path.join(__dirname,'./views/faculty_dashboard.html'));
        return ;
	} else {
		res.send('Please login to view this page!');
	}
	res.end();  
});

app.get('/admindash', (req,res) => {
    if (req.session.loggedin) {
		res.sendFile(path.join(__dirname,'./views/admin_dashboard.html'));
        return ;
	} else {
		res.send('Please login to view this page!');
	}
	res.end(); 
});

app.get('/logout', (req,res)=>{
    req.session.loggedin = false;
    res.redirect('/');
    return;
});

app.get('/deandash', (req,res) => {
    if (req.session.loggedin) {
		res.sendFile(path.join(__dirname,'./views/dean_dashboard.html'));
        return ;
	} else {
		res.send('Please login to view this page!');
	}
	res.end(); 
});

app.post('/auth', urlencodedParser, (req,res) => {
    if(req.body.login_type == 'faculty'){
        var username = req.body.username;
	    var password = req.body.password;
        if(username && password){
            connection.query('SELECT * FROM `faculty_db`.`faculty_details` WHERE `faculty_db`.`faculty_details`.`f_mail_id` = ? AND `faculty_db`.`faculty_details`.`f_pwd` = ?', [username,password], (error, results, fields) => {
                if (results.length > 0) {
                    
                    req.session.loggedin = true;
                    req.session.username = username;
                    res.redirect('/facultydash');
                } else {
                    res.send('<script>alert("Wrong username and/or password!, Go back to continue")</script>');
                }			
                res.end();
            });
        }
        else{
            res.send('<script>alert("Enter username and password, Go back to continue")</script>');
            res.end();
        }
    }
    if(req.body.login_type == 'admin'){
        var username = req.body.username;
	    var password = req.body.password;
        if(username && password){
            if(username == 'admin_amrita' && password== 'admin_amrita'){
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/admindash');
            }
            else{
                res.send('<script>alert("Wrong username and/or password!, Go back to continue")</script>');
            }
        }
        else{
            res.send('<script>alert("Enter username and password, Go back to continue")</script>');
            res.end();
        }
    }
    if(req.body.login_type == 'dean'){
        var username = req.body.username;
	    var password = req.body.password;
        if(username && password){
            if(username == 'dean_amrita' && password== 'dean_amrita'){
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/deandash');
            }
            else{
                res.send('<script>alert("Wrong username and/or password!, Go back to continue")</script>');
            }
        }
        else{
            res.send('<script>alert("Enter username and password, Go back to continue")</script>');
            res.end();
        }
    }
});


app.post('/api/update', urlencodedParser, (req, res) => {
    //console.log(req.body)
    var spawn = require('child_process').spawn;
    var process = spawn('python',['./hello.py', req.body.user_name, req.body.email, req.body.question]);
    process.stdout.on('data', function(data) { 
        res.send(data.toString()); 
    });
});

//listener
var port = 3000;
app.listen(port, ()=> console.log(`Listening on port ${port}...`)); 