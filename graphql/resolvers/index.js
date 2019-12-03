const bcrypt= require('bcryptjs');

// Requiring User and Event models
const Event = require('../../models/event');	
const User = require('../../models/user');
const Bookings = require('../../models/booking');

//populating the events and user models
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

module.exports= {	
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
    bookings: async() =>{
        try{
            const bookings = await Bookings.find();
            return bookings.map(book => {
                return {
                    ...book._doc,
                    _id:book.id,
                    createdAt: new Date(book._doc.date).toISOString(),
                    updatedAt: new Date(book._doc.date).toISOString()
                }
            });
        }catch(err){
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
    },
    bookEvent: async args=> {
        const fetchedEvent = await Event.findOne({_id:args.eventId});
        const booking = new Bookings({
            user:'5de6ac67aec95648107fb652',
            event: fetchedEvent
        });
        const result = await booking.save();
            return {
                ...result._doc,
                _id:result.id,
                createdAt: new Date(result._doc.createdAt).toISOString(),
                updatedAt: new Date(result._doc.updatedAt).toISOString()
            }
    }
 }