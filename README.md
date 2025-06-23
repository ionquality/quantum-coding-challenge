
# Quantum ePay

Welcome to the Quantum ePay project! This guide will walk you through setting up the project locally using Docker (Laravel Sail) and provide access credentials for both local and hosted environments.

Live Demo Access:
A live version of the project is hosted at:

https://quantum.accuratesteel.net

Email: admin@quantumepay.com

Password: quantum
---

## 🚀 Local Development Setup

### 1. Clone the Repository


git clone [https://github.com/your-username/quantum-epay.git](https://github.com/ionquality/quantum-coding-challenge.git)
cd quantum-coding-challenge
2. Install PHP Dependencies
Ensure you have Composer installed, then run:

composer install
3. Install Frontend Dependencies

npm install

4. Configure the Environment
   
Create a .env file in the project root:
Edit the following database environment variables in your .env:

DB_DATABASE=laravel
DB_USERNAME=sail
DB_PASSWORD=password
These are the default credentials for the MySQL container used by Laravel Sail.

5. Start the Application Using Sail
Start the Docker containers using:

./vendor/bin/sail up
This will build and start the Laravel Sail containers for PHP, MySQL, Redis, and more.

6. Run Migrations and Seeders
Once the containers are running, initialize the database:

./vendor/bin/sail artisan migrate:fresh --seed
This will drop all existing tables, recreate them, and populate the database with sample data.

Default Admin Credentials
After running the seeders, a default admin user will be available:

Email: admin@quantumepay.com

Password: quantum

System Requirements
While Laravel Sail manages most dependencies through Docker, you’ll still need the following installed on your system:

Docker (latest stable)

Docker Compose

Composer (latest stable)

Node.js & npm

Running Tests
To run feature or unit tests:

./vendor/bin/sail artisan test
Or, if PHPUnit is installed globally:
php artisan test

Useful Sail Commands

./vendor/bin/sail artisan migrate          # Run migrations
./vendor/bin/sail artisan db:seed          # Seed the database
./vendor/bin/sail npm run dev              # Compile frontend assets
./vendor/bin/sail tinker                   # Run Laravel REPL
