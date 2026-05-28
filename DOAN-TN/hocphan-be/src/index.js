const express=require('express');
const dotenv=require('dotenv');
dotenv.config();
const bodyPaser=require('body-parser');
const database=require('./config/database');
const app=express();
const cors=require('cors');
const cookieParser= require('cookie-parser')

const isProduction = process.env.NODE_ENV === "production";

app.use(cors({
  origin: function (origin, callback) {
    if (!isProduction) {
      return callback(null, true);
    }
    

    if (!origin || 
        origin.includes('netlify.app') || 
        origin === 'https://thegioinuochoa.netlify.app' ||
        (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));



app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit:'50mb'}));
const PORT=process.env.PORT||3001;

database.connect();

const routes=require('./routes/index');
app.use(bodyPaser.json());
app.use(express.json());   
app.use(cookieParser());

// Middleware để log response không có status (chỉ để debug)
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    if (data && typeof data === 'object' && !data.status) {
      console.log('Response không có status:', { url: req.url, method: req.method, data });
    }
    return originalJson.call(this, data);
  };
  next();
});

routes.index(app);


app.get('/',(req,res) =>{
      res.send("hello"); 
})



app.listen(PORT, () =>{
    console.log("Dang chay cong",PORT)
});