const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require("bcrypt");
const multer = require('multer'); 
const User = require("./models/User"); 


const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));


app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/recipe', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB', err));

// Define Recipe schema
const recipeSchema = new mongoose.Schema({
    title: String,
    ingredients: String,
    instructions: String,
    image: String // Add image field to store image path
});

const Recipe = mongoose.model('Recipe', recipeSchema);


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../public/uploads/'); // Specify the destination directory for storing uploaded files
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Generate unique filename for each uploaded file
    }
});


const fileFilter = (req, file, cb) => {
    
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};


const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limit file size to 5MB
    }
});

// Routes

//route prefix
const studentID = "M00912287";
const baseRoute = `/${studentID}`;

//serve the HTML page
app.get(`${baseRoute}/`, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

//fetch recipes
app.get(`${baseRoute}/recipes`, async (req, res) => {
    try {
        const recipes = await Recipe.find({});
        res.json(recipes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
//add recipes
app.post(`${baseRoute}/recipes`, upload.single('image'), async (req, res) => {
    try {
       
        const { title, ingredients, instructions } = req.body;
        
        const newRecipe = new Recipe({
            title: title,
            ingredients: ingredients,
            instructions: instructions,
            image: '/uploads/' + req.file.filename 
        });
        // Save the new recipe to the database
        await newRecipe.save();
        res.status(201).json({ message: 'Recipe added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

//registration
app.post(`${baseRoute}/register`, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

//login
app.post(`${baseRoute}/login`, async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Compare passwords
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        // Password is correct, user authenticated
        res.status(200).json({ message: 'Login successful', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
