# Ride Fleet Car Dealership RESTful API

This is a simple Node.js/Express RESTful API for managing a car dealership, supporting user and admin authentication, car inventory management, sales, and user purchases. The API uses MongoDB for data storage and node-Cache for in-memory caching.

## Features
- User and admin registration & authentication
- Car inventory CRUD operations
- Car purchase and sales tracking
- User profile and purchase history
- In-memory caching for performance
- Pagination and advanced filtering for car listings

## Setup & Installation

1. **Prerequisites:**
    - Node.js (version 20.x.x above)
    - MongoDB
    - Git

2. **Clone the repository:**
   ```bash
   git clone https://github.com/thedunncodes/car-dealership-api
   cd car-dealership
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Configure environment variables:**
   Create a `.env` file in the root directory and set the following variables:

   - `PORT`: Port for the server (default: `5000`)
   - `ADMIN_SLUG`: Generate randomly using `UUID4` or any other secure, non-readable slug generator.
   - `JWT_SECRET_KEY`: Generate randomly using `UUID4` or any other secure key generator.
   - `NODE_ENV`: Set to `dev` for local development or `production` for production build.
   - `DB_NAME`: MongoDB database name (default: `no-database-specified`)

   **If you run your own MongoDB server (e.g., on a virtual machine like Linode):**
   - `DB_HOST`: MongoDB database host (default: `localhost`)
   - `DB_PORT`: MongoDB database port (default: `27017`)

   **If you are connecting to MongoDB hosted elsewhere using a URI:**
   - `DB_CONNECTION_MODE`: Must be set to `URI`
   - `MONGO_URI`: Your MongoDB connection URI

5. **Start the server:**
   ```bash
   npm run build
   npm run start
   # or for development
   npm run dev
   ```

The server will run on the configured port (default: 5000).

## API Endpoints

### Home & Status
| Method | Route   | Description                | Body/Params |
|--------|---------|----------------------------|-------------|
| GET    | `/`     | Welcome message            | None        |
| GET    | `/stat` | API and DB status          | None        |

### User Authentication & Management
| Method | Route                | Description                | Body/Params |
|--------|----------------------|----------------------------|-------------|
| POST   | `/register`          | Register a new user        | `{ email, password, name }`      |
| POST   | `/login`             | User login                 | `{ email, password }`            |
| GET    | `/logout`            | User logout                | Header: `x-token`                |
| GET    | `/user`              | Get user profile           | Header: `x-token`                |
| PUT    | `/user/update`       | Update user profile        | Header: `x-token`, `{ field to be update }`|
| GET    | `/user/purchases`    | Get user purchases         | Header: `x-token`                |
| DELETE | `/user/delete`       | Delete user account        | Header: `x-token`                |

### Admin Management
| Method | Route                           | Description                | Body/Params |
|--------|---------------------------------|----------------------------|-------------|
| POST   | `/admin/register/:adminSlug`    | Register new admin/staff   | `{ email, password, name }`, URL param: `adminSlug` |
| GET    | `/admin/staff`                  | List all staff/admins      | Header: `x-token` (only admin authorised)        |
| DELETE | `/admin/delete/:staffId`        | Delete a staff/admin       | Header: `x-token` (only admin authorised), URL param: `staffId` |

### Car Inventory & Sales
| Method | Route                                 | Description                | Body/Params |
|--------|---------------------------------------|----------------------------|-------------|
| GET    | `/cars`                               | List cars (with filters, pagination) | Query: `brand`, `model`, `bodyType`, `fuelType`, `transmission`, `price`, `mileage`, `year`, `page`, `size` |
| POST   | `/inventory/cars/create`              | Add a new car to inventory | Header: `x-token` (admin), `{ ...carFields }` |
| POST   | `/inventory/cars/buy/:carId`          | Buy a car                  | Header: `x-token`, URL param: `carId`, Body: `amountPaid`         |
| GET    | `/inventory/cars/sales`               | Get car sales data         | Header: `x-token` (only admin/staff)                     |
| PUT    | `/inventory/cars/update/:carId`       | Update car details         | Header: `x-token` (only admin/staff), URL param: `carId`, `{ ...carfields }` |
| DELETE | `/inventory/cars/delete/:carId`       | Delete a car from inventory| Header: `x-token` (only admin/staff), URL param: `carId` |


## Project Structure

- `src/controllers/`: Contains middleware controller files for handling API endpoint logic.
- `src/libs`: Contains reusable libraries or modules to be used in the application.
- `src/routes/`: Defines the API endpoints and associates them with their respective controllers.
- `src/utils/`: Utility functions for app operations.
- `src/constants/`: contains types/interfaces for API endpoints.
- `__tests_`: contains all unit test files for the application.
- `server.ts`: Entry point for the application.

## Request Examples

### Get Cars (with filters & pagination)
```http
GET /cars?brand=toyota&bodyType=suv&page=1&size=10
```
The `brand` and `model` query fields, search cars in the database using regex i.e
```http
GET /cars?brand=toyo&bodyType=suv&page=1&size=10
```
- The query above would still return all `Toyota` cars and any other brand with `toyo` in its name.

## Notes
- All protected routes require an `x-token` header with a valid session token. The token is a JWT token returned from the `GET /login` route.
### `GET /login` response
```http
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...." 
```
### `x-token` implementation
```http
Header:
"x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...." 
```
- Admin-only routes require the user to have an admin role.
- Car fields include: `brand`, `model`, `bodyType`, `transmission`, `fuelType`, `price`, `horsePower`, `mileage`, `year`, `imgUrl`.
- For full request/response details, see the controller and route files.
- To register as a staff on my live API, this slug is available `e01431fd-8f05-49c7-8d0f-aa844b798e1a`. for a  certain period of time.
- ROUTE `/inventory/cars/buy/:carId` DO NOT CONTAIN CODES THAT COULD PROCESS ACTUAL TRANSACTIONS, THIS JUST MOCKS PAYMENT FUNCTION.

## License
This repository is for educational purposes only. Unauthorized use, Distribution, or modification of this code is strictly prohibited.

---

**Author:** [Awwal Adetomiwa](https://github.com/thedunncodes)
