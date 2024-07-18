const express = require('express')
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5500;

//middlewares
app.use(cors());
app.use(express.json());
require('dotenv').config()
const cookieParser = require('cookie-parser');
app.use(cookieParser());



app.get('/', (req, res) => {
  res.send('BillNote Server Running..')
})



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.db_user_name}:${process.env.db_user_password}@cluster-sajib.cqfdgne.mongodb.net/?appName=Cluster-Sajib`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    //jwt api

    app.post('/jwt', async (req, res) => {
        const user = req.body.curUser;
        const token = jwt.sign({ data: user }, process.env.access_token_secret, { expiresIn: '1h' });
        res.send(token);
      });
  
      // verify Token middleware
  
      const verifyToken = (req,res,next) => {
  
        if(!req.headers.authorization){
          return res.status(401).send({message: 'Forbidden Access..'})
        }
        
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.access_token_secret, (err, decoded)=>{
          if(err){
            return res.status(401).send({message: 'Forbidden Access..'})
          }
  
          req.decoded = decoded;
          console.log('jwt varified')
          next();
        })
  
      }




      const UsersCollection = client.db('Bill-Notes').collection('users');



    
    app.post('/addUser', async(req,res)=>{
        const user = req.body;
        const r = await UsersCollection.insertOne(user);
        res.send(r);
    })

    app.get('/getUsers', async(req,res)=>{

        const cursor = UsersCollection.find()
        const r = await cursor.toArray();

        res.send(r)
    })


    app.put('/userApproval:id', async(req,res)=>{
      const id = req.params.id;
      const value = req.body;

      const query = {_id : new ObjectId(id)};

      const update = { 
        $set:{
          status: value
        }
      }

      const r = await UsersCollection.updateOne(query, update)
      res.send(r);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`BillNote Server app listening on port ${port}`)
})

