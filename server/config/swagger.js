const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kapee E-commerce API',
      version: '1.0.0',
      description: 'API documentation for Kapee e-commerce platform with MTN MoMo integration',
      contact: {
        name: 'Kapee Team',
        email: 'support@kapee.com'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000',
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
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'admin'] },
            is_verified: { type: 'boolean' },
            provider: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number', format: 'float' },
            stock: { type: 'integer' },
            category: { type: 'string' },
            image_url: { type: 'string', format: 'uri' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            total: { type: 'number', format: 'float' },
            status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            quantity: { type: 'integer', minimum: 1 }
          }
        },
        MoMoPayout: {
          type: 'object',
          properties: {
            phone: { type: 'string', example: '2507XXXXXXXX' },
            amount: { type: 'number', format: 'float' },
            note: { type: 'string' }
          }
        },
        MoMoPayment: {
          type: 'object',
          properties: {
            amount: { type: 'number', format: 'float' },
            phone: { type: 'string', example: '2507XXXXXXXX' },
            orderId: { type: 'integer' }
          },
          required: ['amount', 'phone', 'orderId']
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'string' }
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
  apis: ['./routes/*.js', './server.js']
};

const specs = swaggerJSDoc(options);

module.exports = specs;
