/**
 * EXPERIENCE: I found it a little difficult to work with Koa in a rush. There isn't a lot of docs out there and the ones that are out there seem to be a bit outdated :(. I am most likely not using it probably but this is how I solved the homework :)
 *
 * Also was worrying about file structure or architecture just the run and gun coding. I was coding and solving along the way, so there is some hacky code in here :)
 *
 */

const Koa = require('koa');
const Router = require('koa-router');
const cors = require('koa-cors');
const app = new Koa();

// I added in bluebird to fix the mongoose.Promise issue
const bluebird = require('bluebird');

//mongoosedb
const mongoose = require('mongoose');

//implemented the fix for the mongoose promise library
mongoose.Promise = bluebird;

//Connect to DB on mlabs
mongoose.connect('mongodb://baker:password@ds119355.mlab.com:19355/baker-project');

// Mongoose Person Schema
const personSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: Number,
  points: { type: Number, default: 0 },
  newUser: { type: Boolean, default: true },
  updated: { type: Date, default: Date.now },
  created: { type: Date, default: Date.now }
});

// I wanted to use Routes initially but koa has some powerful features i'd like to test out
const _ = Router();

//made a new Person Model
const Person = mongoose.model("Person", personSchema);

/**
 * This route was created to fetch users by phone number
 */
_.get('/phone/:id', async ctx => {
    const user = await Person.findOne({"phone" : +ctx.params.id });
    ctx.body = user;
    if (!user) {
      ctx.throw(404);
    }
});

/**
 * Created this route to create a new User/Person
 * probably should change this to person
 */
_.post('/users', async ctx => {
  let { firstName, lastName, email, phone } = ctx.request.query;

  const person = new Person({
    firstName,
    lastName,
    email,
    phone
  })
  const user = await person.save();
  if (!user) {
    ctx.throw(404, "Couldn't create")
  }
  ctx.body = user;
});

/**
 * Made this route to do a patch of the user you are sign in as
 * its a put request but doesn't actually update the entire object so should be a patch
 */
_.put('/users/:id', async ctx => {
  const { points, firstName, lastName } = ctx.request.query;
  const user = await Person.findByIdAndUpdate(
    ctx.params.id,
    {
      $set: {
        points,
        firstName,
        lastName,
        newUser: false,
        updated: new Date()
      }
    }
  );
  ctx.body = user;
  if (!user) {
    ctx.throw(404, 'user does not exist');
  }
});

/**
 * Included cors to quickly get past the cors issue i was running into
 */
app.use(cors({
  origin: true
}));

/**
 * added this to enable routes
 */
app.use(_.routes());

app.listen(3030, function () {
  console.log("Server running on http://localhost:3030");
});

