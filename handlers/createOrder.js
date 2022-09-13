const { buildOrderCreationPayload } = require("../dataInteraction");

const createOrder = async (req, res, { credify }) => {
    // dtgk don'e need to authentication user
    const { referenceId, totalAmount, orderLines, paymentRecipient } = buildOrderCreationPayload(req)

    try {
        const data = await credify.bnpl.createOrder(
            referenceId,
            totalAmount,
            orderLines,
            paymentRecipient
        );
        res.send(data)
    } catch (e) {
        res.status(400).send({ message: e.message })
    }
}

module.exports = createOrder;
