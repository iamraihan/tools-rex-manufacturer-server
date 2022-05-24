const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.2ngeg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const productCollection = client.db("product-collection").collection("products");
        const orderCollection = client.db("order-collection").collection("orders");

        app.get('/products', async (req, res) => {
            const query = {}
            const cursor = productCollection.find(query);
            const number = 6
            const result = await cursor.limit(number).toArray()
            res.send(result)
        })
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await productCollection.findOne(filter)
            res.send(result)
        })
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id
            const update = req.body
            console.log(update);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: update
            };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            console.log(result);
            res.send(result)
        })
        // app.put('/order/:email', async (req, res) => {
        //     const email = req.params.email
        //     const update = req.body
        //     console.log(update);
        //     const filter = { email: email };
        //     const options = { upsert: true };
        //     const updateDoc = {
        //         $set: update
        //     };
        //     const result = await productCollection.updateOne(filter, updateDoc, options);
        //     console.log(result);
        //     res.send(result)
        // })
        app.post('/order', async (req, res) => {
            const order = req.body
            const query = order
            const result = await orderCollection.insertOne(query)
            return res.send({ success: true, result })
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