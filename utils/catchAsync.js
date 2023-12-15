module.exports = fn => {
  return (req, res, next) => {
    //// Both line of code are correct.
    // fn(req, res, next).catch(err => next(err));
    fn(req, res, next).catch(next);
  };
};
