import express from "express";
import db from "../models";



const router = express.Router();

export default function (app) {
  app.use('/', router);
};

router.get('/', (req, res, next) => {
  

  db.User.findAll().then((users) => {
    res.render('index', {
      title: 'Generator-Express MVC with ES6 support',
      users: users
    });
  }).catch(function(e) {
    res.render('index', { data : "failure"})
  }); 
  
  
});






















