
# Stubb

## How to run
Init docker containers

`docker-compose up`

That may take some time to download containers.

Note the db name, username and password must match the ones in Laravel conf file. 

Rename *.env.example* to *.env* and set the correct permissions. With exactly this:  
```
DB_CONNECTION=pgsql
DB_HOST=postgres-stubb
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=d4REn0LdCH4B
```

Hint: is important to replace DB_CONNECTION to *pgsql* instead of the default *mysql*

Now, in order to fill the database, run:

`docker exec -it php-stubb php /src/artisan migrate`

`docker exec -it php-stubb php artisan db:seed`

Or alternativelly just:
`vendor/bin/robo install`

Then, navigate to:
`http://localhost:8001/`

You should see a login screen.

Hint: configure a different port if neccesary and start over.

