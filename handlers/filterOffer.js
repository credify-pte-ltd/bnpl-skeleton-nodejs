const { fetchUserClaimObject } = require("../dataInteraction");

const filterOffer = async (req, res, { credify }) => {
    const credifyId = req.body.credify_id
    const localId = req.body.local_id
    const offers = req.body.offers

    if (!credifyId && !localId) {
        return res.status(400).send({ message: "No ID found" })
    }

    if (!offers) {
        const response = {
            data: {
                offers: [],
            },
        }
        return res.status(200).json(response)
    }

    try {
        if (!offers.length) {
            const response = {
                data: {
                    offers: [],
                },
            }
            return res.status(200).json(response)
        }

        const userClaims = await fetchUserClaimObject(localId, []);
        const personalizedOffers = []

        await Promise.all((offers.map(async (offer) => {
            const result = await credify.offer.evaluateOffer(
                offer.conditions,
                offer.required_custom_scopes || [],
                userClaims
            )

            const formattedOffer = {
                ...offer,
                evaluation_result: {
                    rank: result.rank,
                    used_scopes: result.usedScopes,
                    requested_scopes: result.requestedScopes,
                },
            }

            if (result.rank > 0) {
                // Return only qualified offers
                personalizedOffers.push(formattedOffer)
            }
        })))

        const response = {
            data: {
                offers: personalizedOffers,
            },
        }
        res.json(response)
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
}

module.exports = filterOffer
