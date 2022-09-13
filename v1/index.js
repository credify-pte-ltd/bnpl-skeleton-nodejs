const { Router } = require("express");
const { Credify } = require("@credify/nodejs")

const filterOffer = require('../handlers/filterOffer')
const createOrder = require('../handlers/createOrder')
const pushClaims = require('../handlers/pushClaims')
const countUsers = require('../handlers/countUsers')
const evaluate = require('../handlers/evaluateOffer')
const bnplCallback = require('../handlers/bnplCallback')
const simulation = require('../handlers/simulation')

const formKey = require("../utils/formKey")
const { DEFAULT_PATH } = require("../utils/constants");
const mode = process.env.MODE || "development"
const signingKey = process.env.APP_SIGNING_KEY
const apiKey = process.env.APP_API_KEY

module.exports = ({ }) => {
    const api = Router()

    // This is necessary to start BNPL
    api.post(DEFAULT_PATH.CREATE_ORDERS, async (req, res) => {
        const credify = await Credify.create(formKey(signingKey), apiKey, { mode })
        return createOrder(req, res, { credify })
    })

    api.post(DEFAULT_PATH.PUSH_CLAIMS, async (req, res) => {
        const credify = await Credify.create(formKey(signingKey), apiKey, { mode })
        return pushClaims(req, res, { credify })
    })

    // Called by Credify backend
    api.post(DEFAULT_PATH.OFFERS_FILTERING, async (req, res) => {
        const credify = await Credify.create(formKey(signingKey), apiKey, { mode })
        return filterOffer(req, res, { credify })
    })

    // Called by Credify backend
    api.post(DEFAULT_PATH.USER_COUNTS, async (req, res) => {
        const credify = await Credify.create(formKey(signingKey), apiKey, { mode })
        return countUsers(req, res, { credify })
    })

    // Called by Credify backend
    api.post(DEFAULT_PATH.OFFER_EVALUATION, async (req, res) => {
        const credify = await Credify.create(formKey(signingKey), apiKey, { mode })
        return evaluate(req, res, { credify })
    })

    // Called by Service Provider frontend
    api.get(DEFAULT_PATH.BNPL_COMPLETION_CALLBACK, async (req, res) => {
        const credify = await Credify.create(formKey(signingKey), apiKey, { mode })
        return bnplCallback(req, res, { credify })
    })

    // Deprecated. Called by Service Provider frontend
    api.get(DEFAULT_PATH.OLD_BNPL_COMPLETION_CALLBACK, async (req, res) => {
        const credify = await Credify.create(formKey(signingKey), apiKey, { mode })
        return bnplCallback(req, res, { credify })
    })

    api.post(DEFAULT_PATH.SIMULATION, async (req, res) => {
        const credify = await Credify.create(formKey(signingKey), apiKey, { mode })
        return simulation(req, res, { credify })
    })

    return api;
}  