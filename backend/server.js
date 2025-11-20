const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/exercise", require("./routes/exercise"));
app.use("/api/nutrition", require("./routes/nutrition"));

// Connect MongoDB & start server
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log(err));

app.listen(5000, ()=>console.log("Server running on http://localhost:5000"));
 