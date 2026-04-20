export const errorHandler = (err, _req, res, next) => {
  try {
    const message = err.message || "Internal Server Error";
    const status = err.status || 500;

    res.status(status).json({
      message,
      status,
    });
  } catch (error) {
    next(error);
  }
};
