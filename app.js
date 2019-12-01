const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt= require('bcryptjs');

//mongoose.connect('mongodb://localhost:27017/ekb',{ useNewUrlParser: true });
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
const User = require('./models/user');

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
        type User {
          _id: ID!
          email: String!
          password: String
        }
        input EventInput {
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        input UserInput {
          email: String!
          password: String!
        }

        type RootQuery {
            events: [Event!]!
        }
        type RootMutation {
          createEvent(eventInput: EventInput): Event
          createUser(userInput: UserInput): User
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
          date: new Date(args.eventInput.date),
          creator: '5de38b71fd895152802bdaa7'
        });
        let createdEvent;
        try {
          const result = await event.save();
          createdEvent = { ...result._doc, _id: result._doc._id.toString() };
          const user = await User.findById('5de38b71fd895152802bdaa7');
          if (!user) {
            throw new Error('User not found.');
          }
          user.createdEvents.push(event);
          await user.save();
          return createdEvent;
        }
        catch (err) {
          console.log(err);
          throw err;
        }
      },
      createUser: async args => {
        try {
          const user = await User.findOne({ email: args.userInput.email });
          if (user) {
            throw new Error('User exists already.');
          }
          const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
          const user_1 = new User({
            email: args.userInput.email,
            password: hashedPassword
          });
          const result = await user_1.save();
          return { ...result._doc, password: null, _id: result.id };
        }
        catch (err) {
          throw err;
        }
      },
    graphiql: true
  }
  }));

app.listen(3000,()=>{
  console.log("This is running..");
});
