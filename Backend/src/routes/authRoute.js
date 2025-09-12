import express from 'express' ; 
import {signin , signup , logout , checkAuth } from '../controllers/auth.controller.js' ;
import protectRoute from "../middleware/authmiddleware.js" ;


const router = express.Router();


router.post('/signup', signup);
router.post('/signin', signin);
router.post('/logout', logout); 

router.get('/checkAuth' , protectRoute , checkAuth) ; 

export default router;