// Import required modules
const express = require('express');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mongo-test', {})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Define MongoDB schema
const courseSchema = new mongoose.Schema({
    year: { type: String, required: true },
    courses: [
      {
        code: { type: String, required: true },
        description: { type: String, required: true },
        units: { type: Number, required: true },
        tags: { type: [String], required: true }
      }
    ]
  });

// Define MongoDB model
const Course = mongoose.model('Course', courseSchema);
module.exports = Course;

// Retrieve all published backend courses and sort them alphabetically by their names.
app.get('/backend-courses', async (req, res) => {
    try {
      const courses = await Course.find({}).sort({ description: 1 });
      console.log(courses);
      res.json(courses);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
});
 

// Select and extract the name and specialization of each course
app.get('/courses', async (req, res) => {
    try {
        // Retrieve all courses from the database
        const allCourses = await Course.find({});
        
        // Extract name and specialization for each course
        const extractedCourses = allCourses.flatMap(year => {
            return Object.values(year).flatMap(courseList => {
                return courseList.map(course => ({
                    name: course.description,
                    specialization: course.tags.filter(tag => tag !== course.code).join(', ')
                }));
            });
        });
        
        // Send extracted courses as response
        res.json(extractedCourses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Retrieve all published BSIS (Bachelor of Science in Information Systems) and BSIT (Bachelor of Science in Information Technology) courses from the curriculum.
app.get('/bsis-bsit-courses', async (req, res) => {
    try {
        // Retrieve all published BSIS and BSIT courses
        const courses = await Course.find({
            $or: [
                { "1st Year": { $exists: true } },
                { "2nd Year": { $exists: true } },
                { "3rd Year": { $exists: true } },
                { "4th Year": { $exists: true } }
            ]
        });

        res.json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
