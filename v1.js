const { Router } = require("express")
const { Credify } = require("@credify/nodejs")
const { formKey } = require("./utils")
const {WEBHOOK_EVENTS} = require("./constants");

const signingKey = ""
const apiKey = ""
const mode = "sandbox" // "sandbox" or "production"
const apiDomain = "https://example.com"
const bnplCallbackUrl = "https://example.com"

module.exports = () => {
  const api = Router()

  api.get("/", (req, res) => {
    res.status(200).json({ message: "OK" })
  })

  api.post("/orders", async (req, res) => {
    // TODO: Please update this request body

    // This should be string
    const referenceId = req.referenceId

    // This should be an object { value: "12000000", currency: "vnd" }
    const totalAmount = req.totalAmount

    // This should be an object array
    const orderLines = req.orderLines

    // This is a recipient bank account info
    const paymentRecipient = {
      name: "Demo store",
      number: "xxxxxxxxxxx",
      branch: "",
      bank: "XXX Bank"
    }

    try {
      const credify = await Credify.create(formKey(signingKey), apiKey, { mode })
      const data = await credify.bnpl.createOrder(
        referenceId,
        totalAmount,
        orderLines,
        paymentRecipient
      )
      res.json(data)
    } catch (e) {
      res.status(400).json({ error: { message: e.message } })
    }
  })

  api.post("/webhook", async (req, res) => {
    try {
      const credify = await Credify.create(formKey(signingKey), apiKey, { mode })

      // Validate Webhook request
      const signature = req.headers["signature"] || req.headers["Signature"];
      if (!signature) {
        return res.status(401).send({ message: "Unauthorized" })
      }
      const eventId = req.headers["X-Event-Id"] || req.headers["x-event-id"];
      if (!eventId) {
        return res.status(401).send({ message: "Unauthorized" })
      }
      const timestamp = req.headers["X-Event-Timestamp"] || req.headers["x-event-timestamp"];
      if (!timestamp) {
        return res.status(401).send({ message: "Unauthorized" })
      }

      const trimmedDomain = apiDomain.endsWith("/") ? apiDomain.slice(0, -1) : apiDomain;
      const webhookEndpoint = `${trimmedDomain}/v1/webhook`;
      const valid = await credify.auth.verifyWebhook(signature, req.body, webhookEndpoint, eventId, timestamp);
      if (!valid) {
        return res.status(401).send({ message: "Unauthorized" })
      }

      // Handle webhook

      let orderId;
      switch (req.body.type) {
        case WEBHOOK_EVENTS.OFFER_TX_STATUS_UPDATED:
          // Offer status is updated
          break
        case WEBHOOK_EVENTS.DISPUTE_COMPLETED:
          // Dispute status is updated
          break
        case WEBHOOK_EVENTS.ORDER_STATUS_UPDATED:
          // BNPL order is updated
          orderId = req.body.order_id;
          const status = req.body.order_status;
          // TODO: BNPL order status is updated
          break
        case WEBHOOK_EVENTS.DISBURSEMENT_STATUS_UPDATED:
          // BNPL disbursement docs are confirmed
          break
        default:
          break
      }

    } catch (e) {
      res.json({ error: { message: e.message } })
    }
  })

  api.get("/bnpl/orders/:orderId/redirect", async (req, res) => {
    const orderId = req.params.orderId;
    if (!orderId) {
      return res.sendStatus(500).json({ message: "No order ID" })
    }
    res.redirect(bnplCallbackUrl)
  })

  return api
}
