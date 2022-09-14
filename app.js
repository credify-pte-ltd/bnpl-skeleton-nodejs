const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const v1 = require("./v1")

const app = express()

app.use(morgan("combined"))
app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }))

const port = process.env.PORT || 8000
app.get("/", (req, res) => {
  res.send("health check")
})
app.get("/favicon.ico", (req, res) => res.status(204))
app.use("/v1", v1())

/// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
