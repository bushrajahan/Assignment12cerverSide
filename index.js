const express = require('express');
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET)
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

const uri = "mongodb+srv://jbushra:DQhag4debO39ANNE@cluster0.rgboyow.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const ContestCollection = client.db('LastCollection').collection('LastCollection');
    const CartCollection = client.db('CartCollection').collection('cart');
    const UserCollection = client.db('UserCollection').collection('user');
    const creatorCollection = client.db('creatorCollection').collection('creatr')
    const registratedConllection = client.db('registerCollection').collection('register')
    app.use(express.json());
    app.use(cors());


   
  app.post('/pay',async(req,res)=>{
    const user = req.body;
    //   console.log(user);
    const result = await registratedConllection.insertOne(user)
    console.log(result);
    res.send(result);
  })
  
    app.get('/pay', async (req, res) => {
      const email = req.query.Email;
      const query = { email: email };
      const result = await registratedConllection.find(query).toArray();
      res.send(result);
    });
      app.get('/paying', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await registratedConllection.find(query).toArray();
      res.send(result);
    });
   //creator 
   app.post("/add", async (req, res) => {
    const user = req.body;
    //   console.log(user);
    const result = await creatorCollection.insertOne(user);
    console.log(result);
    res.send(result);
  });
  app.get("/add", async (req, res) => {
    const result = await creatorCollection.find().toArray();
    res.send(result);
  });

  app.put("/add/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  console.log("id", id, data);
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  
  // Modify this part to set the status to 'confirm'
  const updatedUser = {
    $set: {
      name: data.contestName,
      attemptCount: data.attemptCount,
      image:data.image,
      contestType:data.contestType,
       price:data.price,
       desc:data.shortDescription,
       hours:data.hour,
       winning:data.winning,
      status: 'confirm', // Add this line to set the status to 'confirm'
    },
  };

  const result = await creatorCollection.updateOne(
    filter,
    updatedUser,
    options
  );
  res.send(result);
});


  app.get("/add/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await creatorCollection.find(query).toArray();
    res.send(result);
  });

  app.delete('/users/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await creatorCollection.deleteOne(query);
    res.send(result);
  });


//admin
    app.get("/users", async (req, res) => {
      const result = await ContestCollection.find().toArray();
      res.send(result);
    });
    app.post('/users', async (req, res) => {
      const cartItem = req.body;
      const result = await ContestCollection.insertOne(cartItem);
      res.send(result);
    });
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ContestCollection.find(query).toArray();
      res.send(result);
    });

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ContestCollection.deleteOne(query);
      res.send(result);
    });
 


    app.post('/carts', async (req, res) => {
      const cartItem = req.body;
      const result = await CartCollection.insertOne(cartItem);
      res.send(result);
    });

    app.get('/carts', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await CartCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/cart", async (req, res) => {
      const result = await CartCollection.find().toArray();
      res.send(result);
    });

    app.delete('/cart/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await CartCollection.deleteOne(query);
      res.send(result);
    });

    // Users related API

    app.post('/register', async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const result = await UserCollection.insertOne(user);
      res.send(result);
    });

    app.get('/register', async (req, res) => {
      const result = await UserCollection.find().toArray();
      res.send(result);
    });

    app.delete('/register/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await UserCollection.deleteOne(query);
      res.send(result);
    });

    app.patch('/register/admin/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      };
      const result = await UserCollection.updateOne(query, updatedDoc);
      res.send(result);
    });
    app.patch('/register/user/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'user'
        }
      };
      app.patch('/register/creator/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            role: 'creator'
          }
        };
        const result = await UserCollection.updateOne(query, updatedDoc);
        res.send(result);
      });
  
      const result = await UserCollection.updateOne(query, updatedDoc);
      res.send(result);
    });
   

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. Successfully co00000oo00oooo000000oooooonndddjfjgfgected to MongoDB!");
  } finally {
    // Uncomment the following line if you want to close the connection when the application stops
    // await client.close();
  }
}

run().catch(console.dir);

const port =3000
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app is listessrrrsimgnsnioog eeeeeon port ${port}`);
});
