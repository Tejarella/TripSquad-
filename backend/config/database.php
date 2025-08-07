<?php
class Database {
    public $host = 'localhost:3307';
    public $database = 'tripsquad';
    public $username = 'root';
    public $password = ''; // ✅ No password, as per your setup

    public $connection;

    public function connect() {
        $this->connection = new mysqli(
            $this->host,
            $this->username,
            $this->password,
            $this->database
        );

        if ($this->connection->connect_error) {
            die("Database connection failed: " . $this->connection->connect_error);
        }

        return $this->connection;
    }
}
?>
