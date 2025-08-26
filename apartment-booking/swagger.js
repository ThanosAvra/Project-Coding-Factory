const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Apartment Booking API',
      version: '1.0.0',
      description: 'A comprehensive API for apartment booking system with user authentication, apartment management, and booking functionality.',
      contact: {
        name: 'Apartment Booking Team',
        email: 'support@apartmentbooking.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'passwordHash'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN'],
              default: 'USER',
              description: 'User role'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            }
          }
        },
        Apartment: {
          type: 'object',
          required: ['title', 'location', 'pricePerNight', 'owner'],
          properties: {
            _id: {
              type: 'string',
              description: 'Apartment ID'
            },
            title: {
              type: 'string',
              description: 'Apartment title'
            },
            location: {
              type: 'string',
              description: 'Apartment location'
            },
            pricePerNight: {
              type: 'number',
              minimum: 0,
              description: 'Price per night in euros'
            },
            description: {
              type: 'string',
              description: 'Apartment description'
            },
            owner: {
              type: 'string',
              description: 'Owner user ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Apartment creation timestamp'
            }
          }
        },
        Booking: {
          type: 'object',
          required: ['user', 'apartment', 'startDate', 'endDate'],
          properties: {
            _id: {
              type: 'string',
              description: 'Booking ID'
            },
            user: {
              type: 'string',
              description: 'User ID who made the booking'
            },
            apartment: {
              type: 'string',
              description: 'Apartment ID being booked'
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Booking start date'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Booking end date'
            },
            totalPrice: {
              type: 'number',
              minimum: 0,
              description: 'Total booking price'
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'cancelled'],
              default: 'confirmed',
              description: 'Booking status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Booking creation timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
