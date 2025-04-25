const express = require("express");
const app = express();
const port = 5001;

// Middleware to parse JSON
app.use(express.json());

// Example route
app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from Node backend!" });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
