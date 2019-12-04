const express = require('express');	
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
const Event = require('./models/event');	
const User = require('./models/user');

const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event._doc.creator)
      };
    });
    return events;
  } catch (err) {
    throw err;
  }
};

const user = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

const app = express();	



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
          creator : User!
        }	
        type User {	
          _id: ID!	
          email: String!	
          password: String	
          createdEvents : [Event!]
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
            return {
              ...event._doc,
              _id: event.id,
              date: new Date(event._doc.date).toISOString(),
              creator: user.bind(this, event._doc.creator)
            };
          });
        } catch (err) {
          throw err;
        }
      },
      createEvent: async args => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
          creator: '5de6ac67aec95648107fb652'
        });
        let createdEvent;
        try {
          const result = await event.save();
          createdEvent = {
            ...result._doc,
            _id: result._doc._id.toString(),
            date: new Date(event._doc.date).toISOString(),
            creator: user.bind(this, result._doc.creator)
          };
          const creator1 = await User.findById('5de6ac67aec95648107fb652');
    
          if (!creator1) {
            throw new Error('User not found.');
          }
          creator1.createdEvents.push(event);
          await creator1.save();
    
          return createdEvent;
        } catch (err) {
          console.log(err);
          throw err;
        }
      },
      createUser: async args => {
        try {
          const existingUser = await User.findOne({ email: args.userInput.email });
          if (existingUser) {
            throw new Error('User exists already.');
          }
          const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
    
          const user = new User({
            email: args.userInput.email,
            password: hashedPassword
          });
    
          const result = await user.save();
    
          return { ...result._doc, password: null, _id: result.id };
        } catch (err) {
          throw err;
        }	
      }
      },	
    graphiql: true	
  }	)
);	
app.listen(3000,()=>{	
  console.log("This is running..");	
});