const sql = require("msnodesqlv8");
const m = require('http');

const connectionString = "server=.;Database=Master;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}";
const query = "SELECT name FROM sys.databases";

const a = m.ClientRequest;
sql.query(connectionString, query, (err, rows) => {
    console.log(rows);
});