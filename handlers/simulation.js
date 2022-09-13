const simulation = async (req, res, { credify }) => {
    try {
        const productType = req.body.productType
        const providerIds = req.body.providerIds
        const inputs = req.body.inputs
        const response = await credify.offer.simulate(productType, providerIds, inputs)

        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = simulation