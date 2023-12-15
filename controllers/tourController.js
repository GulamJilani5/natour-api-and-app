///////////////////////////////////////
//////////
const Tour = require('../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
// const fs = require('fs');
// const path = require('path');
// // const tours = JSON.parse(
// //   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// // );
// console.log('__dirname', __dirname);
// const filepath = path.join(__dirname, '../dev-data/data/', 'tours-simple.json');
// console.log('filepath', filepath);
// const tours = JSON.parse(fs.readFileSync(filepath));

exports.getAllTours = catchAsync(async (req, res, next) => {
  ///// EXECUTE QUERY
  // Query Object = Tour.find()
  // Query String = req.query
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;
  // console.log('tours ', tours);

  ///// SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.aliasTopTours = (req, res, next) => {
  // this middleware make the api endpoint looks like below one
  // 127.0.0.1:3000/api/tours/?limit=5&sort=-ratingsAverage,price
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,difficulty,ratingsAverage,summary';

  next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
  //127.0.0.1:3000/api/tours/tour-stats
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        // _id: null, // based on this field we are grouping our query
        // _id: '$difficulty',
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $sum: '$price' },
        minPrice: { $sum: '$price' },
        maxPrice: { $sum: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 } // We can sort based on above group
    }
    // {
    //   // $match: { _id: { $ne: 'EASY' } } // We can further match but only based on above group
    // }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  //Tour.findOne({_id: req.params.id})

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  console.log('req.body', req.body);
  ////// METHOD 1
  // const newTour = new Tour(req.body);
  // newTour.save();
  ///// METHOD 2
  const newTour = await Tour.create(req.body);
  console.log('newTour', newTour);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: 'Successfully deleted'
  });
});

///// Finding number of tours happenning by month in a particular years

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  //127.0.0.1:3000/api/tours/monthly-plan/year
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: {
        numTourStarts: -1
      }
    }
    // {
    //   $limit: 6
    // }
  ]);

  // console.log('plan', plan);
  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});
