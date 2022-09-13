const evaluate = async (req, res, { credify }) => {
    if (!req.body.credify_id || !req.body.scopes) {
        return res.status(400).send({ message: "Invalid body" })
    }

    try {
        res.json(response = {
            data: {},
        })
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
}

module.exports = evaluate
