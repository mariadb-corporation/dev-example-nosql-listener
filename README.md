# Get Started with MariaDB's NoSQL Listener 

⚠️ **[UNMAINTAINED]** This repository has been moved and is currently maintained [here](https://github.com/mariadb-developers/mariadb-nosql-listener-quickstart). ⚠️

<br />

This repository contains information on how to create and use a [MariaDB MaxScale](https://mariadb.com/products/enterprise/components/#maxscale) NoSQL Listener with [MariaDB Community Server](https://mariadb.com/products/community-server/).

This `README` will walk you through the process of using a MongoDB driver to connect to and communicate with MariaDB, which includes storing and manage NoSQL document data within MariaDB.

# Table of Contents
1. [Requirements](#requirements)
2. [NoSQL Protocol Module](#nosql-protocol)
2. [Getting Started](#get-started)
3. [Exploring the Data](#explore)
    1. [Querying MariaDB](#query-mariadb)
    2. [MaxScale GUI](#maxscale-gui)
    3. [MongoDB Shell](#mongodb-shell)
4. [Using the TODO Application Directly](#todo-app)
5. [Support and contribution](#support-contribution)
6. [License](#license)

## Requirements <a name="requirements"></a>

Before setting up this sample make sure you have the following installed on your machine.

* [Git](https://git-scm.com/downloads)
* [Docker](https://www.docker.com/get-started)

## NoSQL Protocol Module <a name="nosql-protocol"></a>

The [nosqlprotocol module](https://github.com/mariadb-corporation/MaxScale/blob/develop/Documentation/Protocols/NoSQL.md) allows a MariaDB server or cluster to be used as the backend of an application using a MongoDB client library. Internally, all documents are stored in a table containing two columns; an `id` column for the object id and a `doc` column for the document itself.

When the MongoDB® client application issues MongoDB protocol commands, either directly or indirectly via the client library, they are transparently converted into the equivalent SQL and executed against the MariaDB backend. The MariaDB responses are then in turn converted into the format expected by the MongoDB® client library and application.

<p align="center" spacing="10">
    <kbd>
        <img src="media/mql_to_sql.png" />
    </kbd>
</p>

For more information on the full capabilities see the documentation [here](https://github.com/mariadb-corporation/MaxScale/blob/develop/Documentation/Protocols/NoSQL.md).

## Getting Started <a name="get-started"></a>

1. Clone this repository to your machine.

    ```bash
    $ git clone https://github.com/mariadb-corporation/dev-example-nosql-listener.git
    ```

2. Create the container instances using [Docker Compose](https://docs.docker.com/compose/).

    ```bash
    $ docker-compose up
    ```

    The command above will acquire Docker images and create four container instances.

    a. `mxs` - the [official MariaDB MaxScale image](https://hub.docker.com/r/mariadb/maxscale).

    b. `mdb` - the [official MariaDB Community server image](https://hub.docker.com/_/mariadb).

    c. `todo_client` - a [React.js web application](app/client) that provides a user interface for managing tasks (on a todo list).

    d. `todo_api` - a [Node.js application](app/api) programming interface (API) that exposes REST endpoints for managing data within a database using the [official MongoDB Node Driver](https://docs.mongodb.com/drivers/node/current/).

    **Note**: You can confirm that the `docker-compose up` command has successfully pulled the images and created the containers by executing the following command:

    ```bash
    $ docker ps
    ```

    The result should show that the `mxs`, `mdb`, `todo_client` and `todo_api` are running.

3. Add a new user that MaxScale can use to connect to and communicate with MariaDB Community Server. For this you have two options.

     a. **Option 1**: Connecting to the MariaDB Community Server instance, contained within the mdb container, and using the MariaDB command-line client contained within the container, via docker, to execute the script, add_maxscale_user.sql.
	
	```bash
	$ docker exec -i mdb mariadb --user root -pPassword123! < configuration/add_maxscale_user.sql
	```

    b. **Option 2**: Connecting to the MariaDB Community Server instance, contained within the mdb container, using the MariaDB command-line client on your machine to execute the script, add_maxscale_user.sql.

	```bash
	$ mariadb --host 127.0.0.1 --port 3307 --user root -pPassword123! < configuration/add_maxscale_user.sql
	```

4.  Replace the MaxScale configuration file and restart the MaxScale service

    a. Replace the MaxScale the default configuration file with the [configuration file included in the dev-example-nosql-listener repository](configuration/maxscale.cnf).

		$ docker cp configuration/maxscale.cnf mxs:etc/maxscale.cnf

    b. Restart the MaxScale service within the mxs container.

		$ docker exec -it mxs maxscale-restart

5. Open a browser window and navigate to `http://localhost:3000`, which will load the TODO web application interface.

    <p align="center" spacing="10">
        <kbd>
            <img src="media/demo.gif" />
        </kbd>
    </p>

    The TODO application is made of two pieces:

    1. UI - a React.js project that is hosted within the `todo_client` container and accessed at http://127.0.0.1:3000.

    2. API - a Node.js (+ Express) project that exposes REST endpoints for performing CRUD (create-read-update-delete) operations on (JSON) document data stored, via the MaxScale NoSQL Listener functionality, within MariaDB. The API application is hosted within the `todo_api` container and access at http://127.0.0.1:8080/tasks.

    The TODO application can be used to manage data within MariaDB

## Exploring the Data <a name="explore"></a>

After you've successfully walked through the setup instructions within [Getting Started](#get-started) you're now able to explore the NoSQL Listener capabilities within MariaDB.

### Querying MariaDB <a name="query-mariadb"></a>

If you've used the TODO application to add new `tasks` you can now explore the schema and data that have been added.

You can connect to the MariaDB Community Server instance, contained within the `mdb` container, directly by using the MariaDB client.

```bash 
$ mariadb --host 127.0.0.1 --port 3307 --user root -pPassword123!
```

or by using the MariaDB client, via Docker, that's included within the `mdb` container.

```bash 
$ docker exec -it mdb mariadb --user root -pPassword123!
```

Once you've accessed through the MariaDB CLI client you see the database, named `todo`, that's been created.

```bash
MariaDB [(none)]> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
| todo               |
+--------------------+
```

Stepping into the `todo` database you can also see the new table, `tasks`, that has been created to store the document data.

```bash
MariaDB [(none)]> use todo;
MariaDB [todo]> show create table tasks;
+-------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                                                                                                                                                                                                |
+-------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| tasks | CREATE TABLE `tasks` (
  `id` varchar(35) GENERATED ALWAYS AS (json_compact(json_extract(`doc`,'$._id'))) VIRTUAL,
  `doc` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`doc`)),
  UNIQUE KEY `id` (`id`),
  CONSTRAINT `id_not_null` CHECK (`id` is not null)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 |
+-------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

Notice, that the `tasks` table contains two columns:

- `id`: holds the document data object id
- `doc`: holds the document data itself

And you can query the data, using SQL, just as you can anything else within MariaDB.

```bash
MariaDB [todo]> select * from tasks;
+-------------------------------------+--------------------------------------------------------------------------------------------------------------------------+
| id                                  | doc                                                                                                                      |
+-------------------------------------+--------------------------------------------------------------------------------------------------------------------------+
| {"$oid":"612ad5859c58d2b2b46ca6fa"} | {"description": "Task 1", "_id": {"$oid": "612ad5859c58d2b2b46ca6fa"}, "id": "612ad5859c58d2b2b46ca6fa", "completed": 0} |
| {"$oid":"612aec0aaa1de377a7071d92"} | {"description": "Task 2", "_id": {"$oid": "612aec0aaa1de377a7071d92"}, "id": "612aec0aaa1de377a7071d92", "completed": 1} |
| {"$oid":"612aec10aa1de377a7071d93"} | { "description" : "Task 3", "_id" : { "$oid" : "612aec10aa1de377a7071d93", completed: 0} }                                            |
| {"$oid":"612aec4b923b0597463743f0"} | {"description": "Task 4", "_id": {"$oid": "612aec4b923b0597463743f0"}, "id": "612aec4b923b0597463743f0", "completed": 1} |
+-------------------------------------+--------------------------------------------------------------------------------------------------------------------------+
```

You can even take advantage of MariaDB's JSON querying functionality support.

```bash
MariaDB [todo]> select json_value(doc, '$.description') description, json_value(doc, '$.completed') completed from tasks;
+-------------+-----------+
| description | completed |
+-------------+-----------+
| Task 1      | 0         |
| Task 2      | 1         |
| Task 3      | 0         |
| Task 4      | 1         |
+-------------+-----------+
```

### MaxScale GUI <a name="maxscale-gui"></a>

The [MaxScale graphical user interface (GUI)](https://mariadb.com/resources/blog/getting-started-with-the-mariadb-maxscale-gui/) provides another way you that you can explore the data. 

#### **Logging In**

Start by opening a browser window and navigating to http://localhost:8989. There you'll be prompted to login.

<p align="center" spacing="10">
    <kbd>
        <img src="media/maxscale_gui_login.png" />
    </kbd>
</p>

**Note:** The default username is `admin` and the password is `maxscale`.

#### **Dashboard**

After you've logged in you'll be taken to a dashboard that gives you information on MaxScale, including the service and listener configuration information.

<p align="center" spacing="10">
    <kbd>
        <img src="media/maxscale_gui_dashboard.png" />
    </kbd>
</p>

#### **Query Editor**

On the left side navigation you can select the "Query Editor" menu option.

<p align="center" spacing="10">
    <kbd>
        <img src="media/maxscale_gui_queryeditor.png" />
    </kbd>
</p>

Then you'll be prompted for connection information. For this you can connect directly to a server and/or schema within MariaDB.

For example:

<p align="center" spacing="10">
    <kbd>
        <img src="media/maxscale_gui_connect.png" />
    </kbd>
</p>

After you've connected you can use the Query Editor to execute SQL queries, display datasets and even visualize the data using graphs and charts.

<p align="center" spacing="10">
    <kbd>
        <img src="media/maxscale_gui_queryeditor_dashboard.png" />
    </kbd>
</p>

### MongoDB Shell <a name="mongodb-shell"></a>

You can also use the [Mongo shell client](https://docs.mongodb.com/v4.4/mongo/) to connect to and communicate with MariaDB (via MaxScale). You can find more information on how to do so [here](https://github.com/mariadb-corporation/MaxScale/blob/develop/Documentation/Protocols/NoSQL.md#client-authentication).

## Using the TODO Application Directly <a name="todo-app"></a>

Optionally, if you'd prefer to run the [TODO app](app) directly on your machine, rather than through a container, can do the following:

1. Make sure that you've installed the latest version of [Node.js](https://nodejs.org/en/) and [Node Package Manager (NPM)](https://www.npmjs.com/).

2. Install the node modules for the `client` and `api` applications.

    Within a terminal...

    a. Navigate to [app/client](app/client) and execute:

    ```bash
    $ npm install
    ```

    b. Navigate to [app/api](app/api) and execute:

    ```bash
    $ npm install
    ```

3. Update the MongoDB driver connection string in [app/api/db.js](app/api/db.js) to `'mongodb://127.0.0.1:17017'`.

4. Start the `client` and `api` applications. 

    Within separate terminals...

    a. Navigate to [app/client](app/client) and execute:

    ```bash
    $ npm start
    ```

    b. Navigate to [app/api](app/api) and execute:

    ```bash
    $ npm start
    ```

## Support and Contribution <a name="support-contribution"></a>

Please feel free to submit PR's, issues or requests to this project project or projects within the [official MariaDB Corporation GitHub organization](https://github.com/mariadb-corporation).

If you have any other questions, comments, or looking for more information on MariaDB please check out:

* [MariaDB Developer Hub](https://mariadb.com/developers)
* [MariaDB Community Slack](https://r.mariadb.com/join-community-slack)

Or reach out to us diretly via:

* [developers@mariadb.com](mailto:developers@mariadb.com)
* [MariaDB Twitter](https://twitter.com/mariadb)

## License <a name="license"></a>
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=plastic)](https://opensource.org/licenses/MIT)

