const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour must have less or equal than 40 characters'],
      minLength: [5, 'A tour must have more or equal than 5 characters']
      // I am using it just for learning purpose because isAlpha exlude numbers and spaces both. Only alphabets allowed.
      // validate: [
      //   validator.isAlpha,
      //   'Name should only be string, no numbers or spaces allowed'
      // ]
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: String,
      required: [true, 'A tour must have a size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Dsicount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(),
      select: false // It will not be sent in response
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  // Options, Like - for virtual properties
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
///// VIRTUAL PROPERTY
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

///// 1) DOCUMENT MIDDLEWARE - runs before and after .save() and .create() method but do not work on find() or insert()
tourSchema.pre('save', function(next) {
  // console.log('cocument this ', this); ///// this - refer to currently processing document.
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.pre('save', function(next) {
//   console.log('Will save docuent...');
//   next();
// });
// tourSchema.post('save', function(doc, next) {
//   console.log('doc', doc);
//   next();
// });

///// 2) QUERY MIDDLEWARE - runs before and after find() method.
//// 'this' - query object, Like - regular object. We can set any property on it.
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
  // /^find/ - Regular expression for all the query methods that start with find()
  // console.log('query this', this);
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now(); //Adding start property into the query object which current time.
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log('Query docs', docs);
  next();
});

///// 2) AGGREGATION MIDDLEWARE - runs before and after aggregation query.
///// 'this' - current aggregation object.
///// this.pipeline - current aggregation pipeline object
tourSchema.pre('aggregate', function(next) {
  console.log('this.pipeline', this.pipeline);
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
const Tour = new mongoose.model('Tour', tourSchema);
module.exports = Tour;
