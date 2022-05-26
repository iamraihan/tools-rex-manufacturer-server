const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.2ngeg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized Access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded
        next()
    });
}


async function run() {
    try {
        await client.connect();
        const productCollection = client.db("product-collection").collection("products");
        const orderCollection = client.db("order-collection").collection("orders");
        const userCollection = client.db("order-collection").collection("users");
        const profileCollection = client.db("order-collection").collection("profiles");
        const reviewCollection = client.db("order-collection").collection("reviews");

        app.get('/products', async (req, res) => {
            const query = {}
            const cursor = productCollection.find(query);
            const number = 6
            const result = await cursor.limit(number).toArray()
            res.send(result)
        })
        app.get('/allProducts', async (req, res) => {
            const query = {}
            const cursor = productCollection.find(query);
            const result = await cursor.toArray()
            res.send(result)
        })
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query);
            res.send(result)
        })

        app.post('/productAdd', async (req, res) => {
            const product = req.body
            const query = product
            const result = await productCollection.insertOne(query)
            return res.send({ success: true, result })
        })

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await productCollection.findOne(filter)
            res.send(result)
        })
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id
            const product = req.body
            console.log(update);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: product
            };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            console.log(result);
            res.send(result)
        })

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body
            const filter = { email: email }
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET);
            res.send({ result, token })
        })
        app.get('/users', async (req, res) => {
            const query = {}
            const cursor = userCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/orders', async (req, res) => {
            const query = {}
            const result = await orderCollection.find(query).toArray()
            res.send(result)
        })
        app.post('/order', async (req, res) => {
            const order = req.body
            const query = order
            const result = await orderCollection.insertOne(query)
            return res.send({ success: true, result })
        })

        app.get('/order/:email', verifyJWT, async (req, res) => {
            const email = req.params.email
            const decodedEmail = req.decoded.email
            if (email === decodedEmail) {
                const filter = { email: email }
                const result = await orderCollection.find(filter).toArray()
                res.send(result)
            }
            else {
                return res.status(403).send({ message: 'Forbidden Access' })
            }


        })

        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query);
            res.send(result)
        })

        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email
            const filter = { email: email }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    role: 'admin',
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email
            const filter = { email: email }
            const user = await userCollection.findOne(filter)
            const isAdmin = user.role === 'admin'
            res.send({ admin: isAdmin })
        })

        app.put('/profile/:email', async (req, res) => {
            const email = req.params.email
            const profile = req.body
            const filter = { email: email }
            const options = { upsert: true };
            const updateDoc = {
                $set: profile,
            };
            const result = await profileCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        app.get('/profile/:email', async (req, res) => {
            const email = req.params.email
            const filter = { email: email }
            const result = await profileCollection.findOne(filter)
            res.send(result)
        })

        app.post('/review', async (req, res) => {
            const review = req.body
            const query = review
            const result = await reviewCollection.insertOne(query)
            res.send({ success: true, result })
        })
        app.get('/reviews', async (req, res) => {
            const query = {}
            const result = await reviewCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/order/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await orderCollection.findOne(filter)
            res.send(result)
        })


    } finally { }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})