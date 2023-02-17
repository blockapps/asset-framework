import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Framework Express API",
      version: "0.1.0"
    },
    host: 'localhost:3030', 
    basePath: '/api/v1',
    servers: [
      {
        url: "http://localhost:3030/api/v1",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    "./api/v1/users/users.yaml",
    {{#each assets}}
    './api/v1/{{name}}/{{lower name}}.yaml',
    {{/each}}
  ],
};

const specs = swaggerJsdoc(options);

export default specs;