const countUsers = async (req, res, { credify }) => {
    // This is a future usage. Not necessary at the moment
    try {
        const response = {
            data: {
                counts: [0],
            },
        }
        res.json(response)
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
}

module.exports = countUsers
