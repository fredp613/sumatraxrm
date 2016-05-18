import express from "express";
import db from "../models";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

const saltRounds = 10;
const router = express.Router();

export default function (app) {
  app.use('/', router);
};

router.get('/profile', (req, res, next) => {
   db.User.findOne({
      where: {email: req.body.user.email},
      attributes: ['email']
   }).then((user)=> {
      if (!user) {
          res.json({
             success: false,
             message: "Problem finding user",
             user: null
          })
      } else {          
          res.json({
             success: true,
             message: "User found",
             user: user
          })
      }
   })   
})

router.put('/profile', (req, res, next) => {
   db.User.findOne({
      where: {email: req.body.user.email},
      attributes: ['email', 'firstName', 'lastName']
   }).then((user)=> {

      if (!user) {
          res.json({
             success: false,
             message: "Problem finding user",
             user: null
          })
      } else {  
        //UPDATE USER        
          db.User.update({
            firstName: req.body.user.firstName,
            lastName: req.body.user.lastName,
          }, {
            where: {
              email: req.body.user.email
            }
          }).then((user)=> {
              res.json({
                 success: true,
                 message: "User UPDATED",
                 user: user
              }) 
          });
          
      }
   })
})

router.post('/login', (req, res, next) => {
    db.User.findOne({
      where: {email: req.body.user.email},
      attributes: ['email', 'password']
    }).then((user) => {              
        if (!user) {
           res.json({success: false, message: "Authentication failed - user not found"})
        } else if (user) {  

          bcrypt.compare(req.body.user.password, user.password, function(err, compared) {
              // res == false
              if (compared == false) {
                  res.json({success: false, message: "Password incorrect"})
              } else {
                   jwt.sign(user.toJSON(), 'superSecret', { expiresIn: '25d' }, function(err, token) {    
                      if (err) {
                          res.json({
                            success: false,
                            message: "Problem issuing token",
                            token: null,
                          })
                      } else {
                          res.json({
                            success: true,
                            message: "Enjoy your token",
                            token: token,
                          })
                      }                             
                  }); 
              }
          });         
        }
    })   
});

router.post('/register', (req, res, next) => {

  const password = req.body.user.password
  const passwordConfirmation = req.body.user.passwordConfirmation
  const email = req.body.user.email
  const firstName = req.body.user.firstName
  const lastName = req.body.user.lastName

  if (password !== passwordConfirmation) {
    res.json({
      success:false,
      message: "Passwords don't match",      
    })
  } else {

    const paramPwd = req.body.user.password

    bcrypt.hash(paramPwd, saltRounds, function(err, hash) {
       
      if (err) {
        return res.json({
                success: false,
                message: "Something went wrong",
                token: null,
              })
      } else {
          db.User.findOrCreate({
              where: {
                email: email,
                password: hash,    
                firstName: firstName,
                lastName: lastName  
              }        
            }).spread((user, created)=>{                 
                if (created) {
                    jwt.sign(user.toJSON(), 'superSecret', { expiresIn: '25d' }, function(err, token) {
                      console.log(err);
                      console.log(token);
                      res.json({
                        success: true,
                        message: "Enjoy your token",
                        token: token,
                      })
                    }); 
                } else {
                    res.json({
                      success: false,
                      message: "User already exists",
                      token: null,
                    })
                }                            
            });
        }
    });


      
  }  

});

router.post('/logout', (req, res, next) => {
  //clear cookies and or local storage

   const email = req.body.user.email
   res.json({
      success: true,
      message: "logged out clearing cookie",      
   })    
})

router.delete('/delete', (req, res, next)=> {
    //clear cookies and or local storage  
    console.log(req.body)
    db.User.destroy({
      where: {email: req.body.user.email}
    }).then((success)=>{
      if (success) {
        res.json({
          success: true,
          message: "successfully deleted"
        })
      } else {
        res.json({
          success: false,
          message: "something went wrong"
        })
      }
    })    
})

router.post('/recover', (req, res, next) => {
  //send email and if email success alert user then show a form
  const randomstring = Math.random().toString(36).slice(-8);

  const requestingEmail = req.body.user.email;

  console.log(process.env.EMAIL, process.env.EMAIL_PWD)

  db.PasswordRecovery.destroy({ where: { email: requestingEmail }}).then(()=>{
            db.PasswordRecovery.create({
              email: requestingEmail,
              tempPassword: randomstring,
            }).then((pr)=>{
                if (pr) {
                    const transporter = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: process.env.EMAIL,
                            pass: process.env.EMAIL_PWD,
                        }
                    })

                    const mailOptions = {
                      from: process.env.EMAIL, // sender address
                      to: requestingEmail, // list of receivers
                      subject: 'SUMATRA: Password Recovery', // Subject line
                      text: "This is your temporary password: " + randomstring //, // plaintext body
                      // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
                    };

                    transporter.sendMail(mailOptions, function(error, info){
                        if(error){          
                            res.json({
                              success: true,
                              reponse: error,
                            })
                        } else {          
                            res.json({
                              success: true,
                              reponse: info.response,
                            })
                            
                        };
                    });

                } else {
                  res.json({
                      success: false,
                      reponse: "something went wrong",
                  })

                }
            })

  })
  
})
  
router.put('/recoverconfirm', (req, res, next) => {
  
  let paramTemp = req.body.user.tempPassword
  let paramPwd = req.body.user.password
  let paramPwdConfirm = req.body.user.passwordConfirmation
  let email = req.body.user.email

  db.PasswordRecovery.findOne({
    where: {email:email}
  }).then((pr)=>{
      if (!pr) {
          res.json({
            success: false,
            message: "Something went wrong try again later",
          })
      } else {        
            let temp = pr.tempPassword
            if (paramTemp === temp) {
              if (paramPwd === paramPwdConfirm) {
               
                  //UPDATE USER 
                  bcrypt.hash(paramPwd, saltRounds, function(err, hash) {

                        if (err) {
                                  res.json({
                                    success: false,
                                    message: "Something went wrong try again later",
                                  })
                        } else {
                                  db.User.update({
                                    password: hash,
                                  }, {
                                    where: {
                                      email: req.body.user.email
                                    }
                                  }).then((user)=> {
                                      db.PasswordRecovery.destroy({ where: { email: email }});
                                      res.json({
                                         success: true,
                                         message: "recovered successfully",
                                         user: user
                                      }) 
                                  });
                        }            
                  });                 

              } else {
                res.json({
                  success: false,
                  message: "new passwords don't match"
                })
              }
            } else {
              res.json({
                success: false,
                message: "temp password incorrect"
              })
            }        
        }
      
  })
 
})

//CRUD SESSION


//PRIVATE METHODS

















