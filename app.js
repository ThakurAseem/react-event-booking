const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-yszlp.mongodb.net/${process.env.MONGO_DB}`,{ useNewUrlParser: true });
const db=mongoose.connection;

db.once('open',()=>{
  console.log("Connected to the database");
})

db.on('error',(err)=>{
  console.log(err);
})


const app = express();

const Event = require('./models/event');

app.use(bodyParser.json());

app.use(
  '/graphql',
  graphqlHttp({
    schema: buildSchema(`
        type Event {
          _id: ID!
          title: String!
          description: String!
          price: Float!
          date: String!
        }
        input EventInput {
          title: String!
          description: String!
          price: Float!
          date: String!
        }
        type RootQuery {
            events: [Event!]!
        }
        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: async () => {
        try {
          const events = await Event.find();
          return events.map(event => {
            return { ...event._doc, _id: event.id };
          });
        }
        catch (err) {
          throw err;
        }
      },
      createEvent: async args => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date)
        });
        try {
          const result = await event.save();
          return { ...result._doc, _id: event.id };
        }
        catch (err) {
          console.log(err);
          throw err;
        }
      }
    },
    graphiql: true
  })
);

app.listen(3000,()=>{
  console.log("This is running..");
});
