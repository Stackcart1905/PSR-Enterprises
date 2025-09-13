import dotenv from 'dotenv' ;
   dotenv.config()  ; 

   
import express from 'express' ; 
import cors from 'cors' ;
import cookieParser from 'cookie-parser' ;
import { connectDB } from './lib/db.js';
import authRoutes from "./routes/authRoute.js"
import blogRoutes from './routes/blogRoute.js';
import contactRoute from './routes/contactRoute.js';
import productRoute from "./routes/productRoute.js" ; 




const app  = express () ; 
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// cors origin allow from everywhere
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));


app.use("/api/auth" , authRoutes)
app.use("/api/blog" , blogRoutes)
app.use("/api/contact" , contactRoute)
app.use("/api/products" , productRoute) ; 


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});