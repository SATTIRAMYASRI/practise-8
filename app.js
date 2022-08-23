const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "todoApplication.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  let statusQuery = "";
  let statusResult = null;
  if (status !== undefined && priority !== undefined) {
    statusQuery = `SELECT * FROM todo WHERE status='${status}' && priority='${priority};'`;
  } else if (status !== undefined && priority === undefined) {
    statusQuery = `SELECT * FROM todo WHERE status='${status};'`;
  } else if (status === undefined && priority !== undefined) {
    statusQuery = `SELECT * FROM todo WHERE priority='${priority};'`;
  } else {
    statusQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%;'`;
  }
  statusResult = await db.all(statusQuery);
  response.send(statusResult);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoID } = request.params;
  const getQuery = `SELECT * FROM todo WHERE id=${todoID};`;
  getQueryRes = await db.get(getQuery);
  response.send(getQueryRes);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postQuery = `INSERT INTO (id,todo,priority,status) VALUES (${id},'${todo}','${priority}','${status}');`;
  await db.run(postQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoID } = request.params;
  const { status, priority, todo } = request.body;
  if (status !== undefined) {
    const statusUpdateQuery = `UPDATE todo SET status='${status}' WHERE id=${todoID};`;
    await db.run(statusUpdateQuery);
    response.send("Status Updated");
  } else if (priority !== undefined) {
    const priorityUpdateQuery = `UPDATE todo SET priority='${priority}' WHERE id=${todoID};`;
    await db.run(priorityUpdateQuery);
    response.send("Priority Updated");
  } else if (todo !== undefined) {
    const todoUpdateQuery = `UPDATE todo SET todo='${todo}' WHERE id=${todoID};`;
    await db.run(todoUpdateQuery);
    response.send("Todo Updated");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const todoID = request.params;
  const deleteQuery = `DELETE FROM todo WHERE id=${todoID};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
