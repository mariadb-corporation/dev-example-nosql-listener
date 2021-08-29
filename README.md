# Get Started with MariaDB's NoSQL Listener 

This repository contains information on how to get started using the NoSQL Listener capability of MariaDB MaxScale. 

## Requirements 

Before setting up this sample make sure you have the following installed on your machine.

* [Git](https://git-scm.com/downloads)
* [Docker](https://www.docker.com/get-started)

## Instructions

1. Clone this repository to your machine.

    ```bash
    $ git clone https://github.com/mariadb-corporation/dev-example-nosql-listener.git
    ```

2. Create the container instances uses [Docker Compose](https://docs.docker.com/compose/).

    ```bash
    $ docker-compose up
    ```

3. Add a new MaxScale user to the MariaDB database.

    a. Option 1 - Step into the `mdb` Docker container.

    1. ```bash 
        $ docker exec -it mdb bash
       ```
    2. ```bash
        $ mariadb --user root -pPassword123!
        ```
    3. Copy, paste and execute the scripts [here](configuration/add_maxscale_user.sql).

    b. Option 2 - Execute the [add_maxscale_user.sql](configuration/add_maxscale_user.sql) on the `mdb` server using the MariaDB CLI client.

    ```bash
    $ mariadb --host 127.0.0.1 --port 3307 --user root -pPassword123! < configuration/add_maxscale_user.sql
    ```

4.  Configure and Restart MaxScale

    a. Step into the container instance.

    ```bash
    $ docker exec -it mxs bash
    ```

    b. Copy and paste the configuration [configuration/maxscale.cnf) here to etc/maxscale.cnf.

    You can edit the file using vim.

    ```bash
    $ vi etc/maxscale.cnf
    ```

    Press `i` (to enable insert ability)

    Replace all the contents of the maxscale.cnf file with [this](configuration.maxscale.cnf).

    Press `escape`. Type `:wq` and press `Enter`.

    c. Restart MaxScale

    ```bash
    $ maxscale-restart
    ```

5. Open a browser window and navigate to `http://localhost:3000`.
