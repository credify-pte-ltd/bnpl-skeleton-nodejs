const { Router } = require("express")
const { Credify } = require("@credify/nodejs")
const { formKey, getCategoryItem, mapCategoryFromOrderLine } = require("./utils")
const {WEBHOOK_EVENTS} = require("./constants");
const axios = require("axios");
const dotenv = require('dotenv');
dotenv.config();

const signingKey = process.env.SIGNING_KEY
const apiKey = process.env.API_KEY
const mode = process.env.MODE // "sit" or "production"
const apiDomain = process.env.URL_BASE_MARKET_API
const domainSuccessPage =
  process.env.URL_SUCCESS_PAGE || "https://dienthoaigiakho.vn";

module.exports = () => {
  const api = Router()

  api.get("/", (req, res) => {
    res.status(200).json({ message: "OK" })
  })

  api.post("/orders", async (req, res) => {
    // TODO: Please update this request body

    // This should be string
    const referenceId = req.body.reference_id;

    /**
     * {Object}
     * @example
     * {
     *   "value": "9000000",
     *   "currency": "VND"
     * }
     */
    const totalAmount = req.body.total_amount;

    /**
     * {Array<Object>}
     * @example
     * [
     *   {
     *     "name": "iPhone 12",
     *     "reference_id": "iphone-12-black",
     *     "image_url": "https://www.apple.com/v/iphone-12/j/images/specs/finish_iphone12__ctf4hoqpbnki_large_2x.jpg",
     *     "product_url": "https://www.apple.com/vn/iphone-12/specs/",
     *     "quantity": 1,
     *     "unit_price": {
     *       "value": "9000000",
     *       "currency": "VND"
     *     },
     *     "subtotal": {
     *       "value": "9000000",
     *       "currency": "VND"
     *     },
     *     "measurement_unit": "EA"
     *   }
     * ]
     */
    const orderLines = mapCategoryFromOrderLine(req.body.order_lines);

    // This is a recipient bank account info
    /**
     * {Object}
     * @example
     * {
     *   "name": "Apple VN",
     *   "number": "190123123123",
     *   "branch": "",
     *   "bank": "Techcombank"
     * }
     */
    const paymentRecipient = {
      name: "Công ty TNHH GIÁ KHO GROUP",
      number: "0020100026725004",
      branch: "006",
      bank: "333",
      type: "BANK_ACCOUNT",
    };

    try {
      const credify = await Credify.create(formKey(signingKey), apiKey, {
        mode,
      });
      const data = await credify.bnpl.createOrder(
        referenceId,
        totalAmount,
        orderLines,
        paymentRecipient
      );
      res.json(data);
    } catch (e) {
      res.status(400).json({ error: { message: e.message } });
    }
  });

  api.post("/simulation", async (req, res) => {
    const productType = req.body.product_type;

    // TODO: Please update this request body

    // This should be string array (can be empty)
    const providerIds = req.body.provider_ids || [
      "09de7359-7f29-41a0-bd07-095d1ce7f85d",
    ];

    // This should be an object
    /**
     * {
     *   "market_id": "",
     *   "transaction_amount": {
     *     "value": "1200000",
     *     "currency": "VND"
     *   },
     *   "loan_tenor": {
     *     "value": 30,
     *     "unit": "DAY"
     *   },
     *   "disbursement_date": "2022-12-25",
     *   "product": {
     *     "manufacturer": "",
     *     "category": "",
     *     "name": ""
     *   },
     *   "down_payment": {
     *     "value": "200000",
     *     "currency": "VND"
     *   }
     * }
     */
    let inputs = req.body.inputs;
    inputs = {
      ...inputs,
      product: {
        manufacturer: "temp",
        category: "temp",
        name: "temp",
      },
    };

    try {
      const credify = await Credify.create(formKey(signingKey), apiKey, {
        mode,
      });
      const response = await credify.offer.simulate(
        productType,
        providerIds,
        inputs
      );
      res.json(response);
    } catch (e) {
      res.status(400).json({ error: { message: e.message } });
    }
  });

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
          const referenceId = req.body.reference_id;

          try {
            const { data } = await axios.get(
              `${apiDomain}/api/v2/sale-orders/${referenceId}`
            );
            const internalOrderInfo = data.extra_data;
            const currentOrderStatus = internalOrderInfo.bnplTx.status
            if (currentOrderStatus === status) {
              return res.status(200).json({ message: "No update" })
            }
            const res = await axios.patch(
              `${apiDomain}/api/v2/sale-orders/${referenceId}`,
              {
                extra_data: {
                  ...internalOrderInfo,
                  bnplTx: {
                    orderId,
                    status,
                  },
                },
              }
            );
          } catch (e) {
            return res.status(500).json({ message: e.message })
          }

          break
        case WEBHOOK_EVENTS.DISBURSEMENT_STATUS_UPDATED:
          // BNPL disbursement docs are confirmed
          break
        default:
          break
      }

      return res.status(200).json({ message: "Success" })
    } catch (e) {
      res.json({ error: { message: e.message } })
    }
  })

  api.post("/push-claims", async (req, res) => {
    // Nothing to do. Just return 200 status
    res.status(200).json({ credifyId: "" })
  })

  api.get("/bnpl/orders/:orderId/redirect", async (req, res) => {
    const orderId = req.params.orderId;
    const isError = !!req.query.error_message;
    const url = isError ? `${domainSuccessPage}/mua-tra-gop/cancel` : `${domainSuccessPage}/mua-tra-gop/success`;

    if (!orderId) {
      return res.sendStatus(500).json({ message: "No order ID" })
    }
    res.redirect(url)
  })

  api.post("/offers", async (req, res) => {
    // This should be string
    const localId = req.body.local_id;

    /**
     * {Object}
     * {
      "phone_number": "999720410",
      "country_code": "+81",
      "credify_id": "38e67621-b57e-4eb1-b2ae-66eb3f9817f0",
      "product_types": [
        "consumer-financing:unsecured-loan:bnpl"
      }]
      "bnpl": {
          "item_category": "string",
          "item_count": 0,
          "total_amount": {
          "value": "30000000.00",
          "currency": "VND"
        }
      }
     * */
    const inputs = {
      phone_number: req.body.phone_number,
      country_code: req.body.country_code,
      credify_id: req.body.credify_id,
      product_types: req.body.product_types,
      bnpl: {
        item_category: getCategoryItem(req.body.bnpl.item_category),
        item_count: req.body.bnpl.item_count,
        total_amount: req.body.bnpl.total_amount,
      },
    };
    try {
      const credify = await Credify.create(formKey(signingKey), apiKey, {
        mode,
      });
      const response = await credify.offer.getList(localId, inputs);
      res.json(response);
    } catch (e) {
      res.status(400).json({ error: { message: e.message } });
    }
  });

  return api;
}
