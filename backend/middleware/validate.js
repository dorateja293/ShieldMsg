export function validate(schema) {
  return (request, _response, next) => {
    request.validated = schema.parse({
      body: request.body,
      params: request.params,
      query: request.query
    });
    next();
  };
}
