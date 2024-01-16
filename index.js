const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')


const app = express();

app.use(express.json());
app.use(cors({
  origin:[
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials:true
}));
const uri = "mongodb+srv://jbushra:DQhag4debO39ANNE@cluster0.rgboyow.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
// console.log(process.env.ACCESS_TOKEN)

async function run() {
  try {
    // await client.connect();
    const ContestCollection = client.db('LastCollection').collection('LastCollection');
    const CartCollection = client.db('CartCollection').collection('cart');
    const UserCollection = client.db('UserCollection').collection('user');
    const creatorCollection = client.db('creatorCollection').collection('creatr')
    const registratedConllection = client.db('registerCollection').collection('register')
    const paidCollection = client.db('paidCollection').collection('paid')
    const winnerCollection = client.db('winnerCollection').collection('winner')
    const paymentCollection = client.db('paymentCollection').collection('payment')
    const WinnerCollection = client.db('paymentCollection').collection('winner')
    const upcomingCollection = client.db('LastCollection').collection('Upcoming Contest');

    //jwt token related 
    app.post('/jwt',async(req,res)=>{
      const user = req.body ;
      console.log('user for token is existed here ',user)
      const token = jwt.sign(user,process.env.ACCESS_TOKEN,{expiresIn:'10h'})
      res.cookie('token',token,{
        httpOnly:true,
        secure:true,
        sameSite:'none'
      })
      
      .send({success:true})
    })
   app.post('/logout',async(req,res)=>{
        const user = req.body;
        console.log('logout')
        res.clearCookie('token',{maxAge:0}).send({success:true})
   })


    app.get('/upcoming',async(req,res)=>{
      const result = await upcomingCollection.find().toArray();
      res.send(result)
     })

    app.post('/payments', async (req, res) => {
      const pay = req.body;
      
    
      const result = await paymentCollection.insertOne(pay);
      console.log(result);
      res.send(result);
    });
    app.get('/payments',async(req,res)=>{
      const result = await paymentCollection.find().toArray();
      res.send(result)
     })
     app.get("/payments/:param", async (req, res) => {
      const param = req.params.param;
    
      // Check if the parameter is a valid ObjectId
      if (ObjectId.isValid(param)) {
        // If it's a valid ObjectId, treat it as an ID
        const queryById = { _id: new ObjectId(param) };
        const resultById = await paymentCollection.findOne(queryById);
        res.send(resultById);
      } else {
        // If it's not a valid ObjectId, treat it as an email
        const queryByEmail = { email: param };
        const resultByEmail = await paymentCollection.find(queryByEmail).toArray();
        res.send(resultByEmail);
      }
    });
    app.get("/payments/email/:email", async (req, res) => {
      const email = req.params.email;
    
      // Assuming you want to filter based on isWinner being true
      const query = { email: email, isWinner: true };
    
      try {
        const result = await paymentCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Internal Server Error");
      }
    });
    
    app.get('/payments/pay/p/:Email',async(req,res)=>{
      const Email = req.params.Email;
      const query = {Email:Email}
      const result = await paymentCollection.findOne(query)
      res.send(result)
   })
 





    app.put("/payments/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log("id", id, data);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedUSer = {
        $set: {
          isWinner:data.isWinner
        },
      };
      const result = await paymentCollection.updateOne(
        filter,
        updatedUSer,
        options
      );
      res.send(result);
    });
   
 
 



     app.post('/pyment',async(req,res)=>{
      const {price} = req?.body;
      const amount = parseInt(price * 100);
      console.log(amount,'amount inside the post method')
      const paymentIntent = await stripe.paymentIntents.create({
        amount : amount,
        currency:'usd',
        payment_method_types:[
          'card'
        ]
      });
      res.send({
        clientSecret: paymentIntent.client_secret
      })
     })

     app.post('/winner', async (req, res) => {
      
    });
    app.get("/winner", async (req, res) => {
      const result = await winnerCollection.find().toArray();
      res.send(result);
    });
   
  app.post('/day',async(req,res)=>{
    const user = req.body;
      console.log(user);
    const result = await paidCollection.insertOne(user)
    console.log(result);
    res.send(result);
  })
  
    app.get('/day', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await paidCollection.find(query).toArray();
      res.send(result);
    });
 
   //creator 
   app.post("/add", async (req, res) => {
    const user = req.body;
      console.log(user);
    const result = await creatorCollection.insertOne(user);
    console.log(result);
    res.send(result);
  });
  // app.get("/add", async (req, res) => {
  //   const result = await creatorCollection.find().toArray();
  //   res.send(result);
  // });

  app.get('/add',async(req,res)=>{

      const user = req.body;
      const result =await creatorCollection.find(user).toArray()
      res.send(result)

  })
   app.get('/add/ad', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await creatorCollection.find(query).toArray();
      res.send(result);
    });

    app.put("/add/ad/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log("Received Data:", data);

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updatedUser = {
        $set: {
          contestName: data.contestName,
          price: data.price,
          shortDescription: data.shortDescription,
      
          contestType:data.contestType,
          name: data.name,
         
   
        },
      };

      const result = await creatorCollection.updateOne(
        filter,
        updatedUser,
        options
      );
      res.send(result);
    });
    
     //put for status
     
    app.put("/add/ad/status/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log("Received Data:", data);

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updatedUser = {
        $set: {
          status:'approved'
   
        },
      };

      const result = await creatorCollection.updateOne(
        filter,
        updatedUser,
        options
      );
      res.send(result);
    });

    app.get("/add/ad/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await creatorCollection.find(query).toArray();
      res.send(result);
    });
    
    app.delete('/add/ad/:id', async (req, res) => {
      const id = req.params.id;
      const session = client.startSession();
    
      try {
        await session.withTransaction(async () => {
          const query = { _id: new ObjectId(id) };
    
          // Delete document from creatorCollection
          const resultCreator = await creatorCollection.deleteOne(query, { session });
    
          // Delete document from ContestCollection
          const resultContest = await ContestCollection.deleteOne(query, { session });
    
          // Check if both deletes were successful
          if (resultCreator.deletedCount === 1 && resultContest.deletedCount === 1) {
            res.status(200).json({ message: 'Document deleted successfully from both collections' });
          } else {
            res.status(404).json({ error: 'Document not found in one or both collections' });
          }
        });
      } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      } finally {
        session.endSession();
      }
    });
    
    
app.get('/search', async (req, res) => {
  const contestType = req.query?.contestType;
  const query = contestType? {contestType} : {}
  // const query = { contestType:contestType };
  const result = await ContestCollection.find(query).toArray();
  res.send(result);
});






//admin
    app.get("/users", async (req, res) => {

  const contestType = req.query?.contestType;
  const query = contestType? {contestType} : {}
  // const query = { contestType:contestType };
  const result = await ContestCollection.find(query).toArray();
  res.send(result);
});
app.get("/users/use", async (req, res) => {

  const contestType = req.query;
  console.log(contestType)
    const page = parseInt(req.query.page) ;
    const size = parseInt(req.query.size);
    const result =await  ContestCollection.find()
    .skip(page * size)
    .limit(size)
    .toArray();
    res.send(result)

  });


 app.get('/usersCount',async(req,res)=>{
  const count = await ContestCollection.estimatedDocumentCount()
  res.send({count})
 })


app.get("/users/:id", async (req, res) => {
  const id = req.params.id;

  // Check if the provided id is a valid ObjectId
  if (ObjectId.isValid(id)) {
    // If it's a valid ObjectId, treat it as an ID
    const queryById = { _id: new ObjectId(id) };
    const resultById = await ContestCollection.findOne(queryById);
    if (resultById) {
      res.send(resultById);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } else {
    // If it's not a valid ObjectId, treat it as a string ID
    const queryByStringId = { _id: id };
    const resultByStringId = await ContestCollection.findOne(queryByStringId);
    if (resultByStringId) {
      res.send(resultByStringId);
    } else {
      res.status(404).json({ error: 'User id  not found' });
    }
  }
});



app.post('/users', async (req, res) => {
  const cartItem = req.body;

  // Generate a unique _id if not provided
  if (!cartItem._id) {
    cartItem._id = new ObjectId(); // Ensure you import ObjectId from the MongoDB driver
  }

  // Check if the _id already exists in the database
  const existingUser = await ContestCollection.findOne({ _id: cartItem._id });

  if (existingUser) {
    // If the _id already exists, send an error message to the client
    return res.status(400).json({ error: 'User with the same _id already exists' });
  } else {
    // If the _id doesn't exist, insert the new user
    const result = await ContestCollection.insertOne(cartItem);
    res.send(result);
  }
});



   
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log(id,data)
      const filter = {_id : new ObjectId(id)}
      const options = {upsert : true}
      const UpdatedUser = {
        $set:{
          attemptedCount: data.attemptedCount,
        }
        
      }
      const result = await ContestCollection.updateOne(
         filter,
         UpdatedUser,
         options
      )
      console.log(result);
      res.send(result);
    });
    

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ContestCollection.deleteOne(query)
      res.send(result);
    });
    app.get('/gaming', async (req, res) => {
      const result = await ContestCollection.find({contestType: 'Gaming'}).toArray();
       res.send(result)
     });
    
    app.get('/medical', async (req, res) => {
      const result = await ContestCollection.find({contestType: 'Medical'}).toArray();
       res.send(result)
     });
    
    app.get('/article', async (req, res) => {
      const result = await ContestCollection.find({contestType: 'Article'}).toArray();
       res.send(result)
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
    
    app.get('/admin', async (req, res) => {
       const result = await UserCollection.find({role : 'admin'}).toArray();
        res.send(result)
      });
        app.get('/creator', async (req, res) => {
       const result = await UserCollection.find({role : 'creator'}).toArray();
        res.send(result)
      });
     
  app. get('/user', async (req, res) => {
        const result = await UserCollection.find({role : 'user'}).toArray();
         res.send(result)
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
   

    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. Successfully co00000oo00o000000opo  ghbvcxgt0099ooo000000oooooonndddjfjgfgected to MongoDB!");
  } finally {
    // Uncomment the following line if you want to close the connection when the application stops
    // await client.close();
  }
}

run().catch(console.dir);

const port =300
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {console.log(`Examoooooooooooooooooodoooop0000000000listesslllll000000lllriirrsimg000000000000000 nsn0000ioog99jhk eeeeeooooo000000000ooon poooort ${port}`);
});
