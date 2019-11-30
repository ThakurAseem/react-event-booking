const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Event = require('./models/event');

const app = express();

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
          console.log(result);
          return { ...result };
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

mongoose
  .connect('mongodb+srv://ABC:1234@cluster0-yszlp.mongodb.net/test',{ useNewUrlParser: true },{ useUnifiedTopology: true })
  .then('on',()=>{
      app.listen(3000,()=>{
          console.log("This is running..");
      });
  })
  .catch('once',(err)=>{
      console.log(err);
  })
