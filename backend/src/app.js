const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

/* Routes */
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require("./routes/chat.routes");
const messageRoutes = require('./routes/message.routes');
const contextRoutes = require('./routes/context.routes');
const corsOptions = require('./corsOptions');


const app = express();
app.use(cors(corsOptions));


/* using middlewares */
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));



/* Using Routes */
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/context', contextRoutes);

app.get("*name", (req, res)=>{
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;