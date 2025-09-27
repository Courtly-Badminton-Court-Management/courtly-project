module.exports = {
  api: {
    input: {
        target: "./schema.json"
    },
    output: {
      mode: "tags-split",                 // split per API tag
      target: "src/api-client/endpoints", // generated endpoints
      schemas: "src/api-client/schemas",  // generated types
      client: "react-query",              // auto-generate React Query hooks
      prettier: true,
      clean: true,
      override: {
        mutator: {
          path: "src/api-client/custom-client.ts", // always use your custom client
          name: "customRequest",
        },
      },
    },
  },
};
