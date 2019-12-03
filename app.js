const express = require('express');	
const graphqlHttp = require('express-graphql');	
const mongoose = require('mongoose');	


const resolver = require('./graphql/resolvers/index')
const graphqlschema = require('./graphql/schema/index')


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



app.use('/graphql',graphqlHttp({	
    schema: graphqlschema,	
    rootValue: resolver,	
    graphiql: true	
  }	)
);	
app.listen(3000,()=>{	
  console.log("This is running..");	
});