const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const app = express()
const mongoDB_Url = 'mongodb://localhost:27017/addressDB'

//Server class
class Server{
    constructor(mongoDB_Url){

        this.url = mongoDB_Url

        //Initializing DB
        mongoose.connect(this.url, {useNewUrlParser: true})
        
        //Creating address document schema, with Validation
        const addressSchema = new mongoose.Schema({
            name: {
                type: String,
                required: [true, 'Please check your entry, no name specified']
            },
            address: {
                type: String,
                required: [true, 'Please check your entry, no address specified']
            },
            primaryEmail: {
                type: String,
                required: [true, 'Please check your entry, no primary email specified']
            },
            secondaryEmail: {
                type: String,
                required: [true, 'Please check your entry, no secondary email specified']
            },
            contactNumber: {
                type: Number,
                min: 1111111111,
                max: 9999999999,
                required: [true, 'Please check your entry, no contac number specified']
            },
        })

        //Creating Address Model
        this.Address = mongoose.model('Address', addressSchema)

        this.initMiddleWare()
        this.listenServer()
        this.initRoutes()
    }

    initMiddleWare(){
        app.use(express.json())
        app.use(bodyParser.urlencoded({extended: true}))
    }

    //JWT Authentication
    verifyJWT(req, res, next){
        const token = req.headers['x-access-token']
    
        if(token){
            jwt.verify(token, 'jwtsecret', function(error, decoded){
                if(error){
                    res.send({isAuth: false, message: 'You are not authenticated to make this request.'})
                }else{
                    req.userId = decoded.id
                    next()
                }
            })
        }else{
            res.send('You are not authenticated to make this request.')
        }
    }

    initRoutes(){
        //A local copy Address Model object
        const Address = this.Address
        
        app.get('/get-token', function(req, res){
            //creating a JWT token, Keeping payload and secret key basic and visible for the simplicity of this assignment
            const token = jwt.sign({payload: 'payload'}, 'jwtsecret', {
                expiresIn: 600,
            })

            //Sending JWT token to client
            res.send({message: 'Token expires in 10 minutes', authToken : token})
        })

        //Check if user is authenticated
        app.post('/check-auth',this.verifyJWT, function(req, res){
            // console.log(req.headers['x-access-token'])
            res.send({message: 'You are Authenticated', isAuth: true})
        })

        ///////////////Routes for all Address entry///////////////////////
        app.route('/address-book')
        //Read all the entries in DB
        .get(this.verifyJWT, function(req, res){
            Address.find(function(error, foundAddresses){
                if(error){
                    console.log(error)
                    res.send(error)
                }else{
                    res.send(foundAddresses)
                }
            })
        })
        //Add a contact
        .post(this.verifyJWT, function(req, res){
            const address = new Address(req.body)
            address.save(function(error){
                if(error){
                    console.log(error)
                    res.send(error)
                }else{
                    res.send('Successfully added data.')
                }
            })
        })
        //Delete all contacts
        .delete(this.verifyJWT, function(req, res){
            Address.deleteMany(function(error){
                if(error){
                    console.log(error)
                    res.send(error)
                }else{
                    res.send('Successfully deleted all the data.')
                }
            })
        })
        
        ///////////////Routes for single Address entry///////////////////////
        app.route('/address-book/:personName/:contactNumber')
        //Read a specified contact based on name and contact number provided as URI parameters
        .get(this.verifyJWT, function(req, res){
            Address.findOne({
                name: req.params.personName,
                contactNumber: req.params.contactNumber
            }, function(error, foundContact){
                if(error){
                    console.log(error)
                    res.send(error)
                }else{
                    if(foundContact){
                        res.send(foundContact)
                    }else{
                        res.send('No match found.')
                    }
                }
            })
        })
        //updating a specified contact
        .patch(this.verifyJWT, function(req, res){
            Address.updateOne(
                {
                    name: req.params.personName,
                    contactNumber: req.params.contactNumber
                },
                {$set: req.body},
                function(error, writeOpResult){
                  if(error){
                      console.log(error)
                      res.send(error)
                  }else{
                      res.send({message: 'Successfully updated.', writeOpResult: writeOpResult})
                  }
                }
              );
        })
        //Deleting a specified contact
        .delete(this.verifyJWT, function(req, res){
            Address.findOneAndDelete({
                name: req.params.personName,
                contactNumber: req.params.contactNumber
            }, function(error, foundContact){
                if(error){
                    console.log(error)
                    res.send(error)
                }else{
                    if(foundContact){
                        res.send({message : 'This entry is deleted.', entry: foundContact})
                    }else{
                        res.send('No match found to delete.')
                    }
                }
            })
        })
    }

    //Listening on port 3000
    listenServer(){
        app.listen(3000, function(req, res){
            console.log('Server is up and running at PORT : 3000')
        })
    }


}

//Creating a Server object
new Server(mongoDB_Url)