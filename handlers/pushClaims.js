const pushClaims = async (req, res, { credify }) => {
    const credifyId = req.body.credify_id

    return res.status(200).json({ credifyId })
}

module.exports = pushClaims
