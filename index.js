const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs-extra');
const fileUpload = require('express-fileupload')
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l4d6v.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
  res.send('hi db i am working!')
})






const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("agencydb").collection("services");
  const reviewCollection = client.db("agencydb").collection("reviews");
  const serviceListCollection = client.db("agencydb").collection("serviceList");
  const adminCollection = client.db("agencydb").collection("adminEmail");


  //for service
  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const description = req.body.description;
    const title = req.body.title;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64'),

    };


    serviceCollection.insertOne({ image, description, title })
      .then(result => {


        res.sendStatus(result.insertedCount ? 200 : 500)


      })

  })



  app.get('/service', (req, res) => {
    serviceCollection.find({})
      .toArray((err, documents) => {
        // fs.remove(filePath, error => {
        //   if (error) {
        //     console.log(error)
        //     res.status(500).send({ msg: 'Failed to upload image' })
                  res.send(documents);
      })
  })


  //for review
  app.post('/addReviews', (req, res) => {
    const review = req.body;
    console.log(review)
    reviewCollection.insertOne(review)
      .then(result => {
        console.log(result.insertedCount)
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/review', (req, res) => {
    reviewCollection.find({}).limit(6)
      .toArray((err, documents) => {
        res.send(documents);
      })
  })


  //for serviceList
  app.post('/addServiceList', (req, res) => {
    const orders = req.body;
    serviceListCollection.insertOne(orders)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/userService', (req, res) => {
    serviceListCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/allServices', (req, res) => {
    serviceListCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })




  app.post('/adminEmail', (req, res) => {
    const email = req.body;
    adminCollection.insertOne(email)
      .then(result => {
        console.log(result)
        res.send(result)
      })
  })



  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
      .toArray((err, admin) => {
        res.send(admin.length > 0);
      })
  })











});






app.listen(process.env.PORT || port)