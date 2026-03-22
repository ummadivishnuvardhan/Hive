const express = require("express");
const app = express();

const userRoutes = require("./routes/userRoutes");

// Middleware to auto-parse frontend JSON POST data
app.use(express.json()); 

// API Routes
app.use("/user", userRoutes);

// Root Health Route
app.get("/", (req, res) => {
    res.send("Hive Server is running!");
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));