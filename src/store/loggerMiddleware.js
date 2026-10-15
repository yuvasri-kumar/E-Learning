const LOGGED_PREFIXES = ["learning/", "courses/"];
const loggerMiddleware = () => (next) => (action) => {
  const shouldLog =
    action &&
    typeof action.type === "string" &&
    LOGGED_PREFIXES.some((prefix) => action.type.startsWith(prefix));
  if (shouldLog) {
    console.log(
      `[Learning Action] ${action.type}`,
      action.payload !== undefined ? action.payload : ""
    );
  }
  return next(action);
};
export default loggerMiddleware;
