class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    ///// BUILD QUERY
    // 1A) Filtering(Querying, Reading)
    // 127.0.0.1:3000/api/tours?price=500&duration=5
    // 127.0.0.1:3000/api/tours?price[lte]=500&duration=5
    const queryObj = { ...this.queryString }; //MAKING SHALLOW COPY AND CREATING OBJECT SO THAT IT DOES REFERE THE SAME OBJECT(eg. req.query)
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);
    // console.log(req.query, queryObj);

    // 1B) Advance filtering
    // { duration: { '$gte': '5' }, difficulty: 'easy' }
    let queryStr = JSON.stringify(queryObj); // MAKING JASON STRING
    //// b - exact match, g - multiple match
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // console.log(JSON.parse(queryStr));

    // let query = Tour.find(JSON.parse(queryStr));
    // const query = Tour.find({ duration: '5', difficulty: 'easy' });
    // const query = Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');'
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }
  sort() {
    // 127.0.0.1:3000/api/tours?sort=price,duration
    if (this.queryString.sort) {
      // console.log(req.query.sort); // price,duration
      const sortBy = this.queryString.sort.split(',').join(' '); // price duration
      // console.log('sortBy ', sortBy);
      // query = query.sort('price duration');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-creatAt');
    }

    return this;
  }
  limitFields() {
    // 127.0.0.1:3000/api/tours?field=name,duration,difficulty,price
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      // console.log('fields', fields);
      // query = query.select('name duration difficulty price');
      this.query = this.query.select(fields);
    } else {
      // excluding '__v' to send in the response, alternatively we can do in schema creation time as well(eg. for password).
      // schema option - {select:false}
      this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    // 127.0.0.1:3000/api/tours?page=2&limit=3
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    ///// No need to send any error because user will get nothing if page is out of limit
    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }
    return this;
  }
}

module.exports = APIFeatures;
