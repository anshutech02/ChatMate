const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

/* Routes */
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require("./routes/chat.routes");
const messageRoutes = require('./routes/message.routes');
const contextRoutes = require('./routes/context.routes');


const app = express();
const allowedOrigins = new Set([
  'http://localhost:5173',
  ...(process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
}));


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