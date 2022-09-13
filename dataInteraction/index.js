////////////////////////////////////////////
// REQUIRED IMPLEMENTATION
////////////////////////////////////////////
/**
 * This returns Credify scope object for a specified user.
 *
 * @param localId string. Internal ID in your system
 * @param includingScopes string[]. If this is empty, it means all scopes.
 * @returns {Promise<Object|null>}
 */
const fetchUserClaimObject = async (localId, includingScopes) => {
    const user = await getUserInfo(localId)

    if (!user) {
        console.error('not found user', localId)
        return null
    }

    const shareableProfile = (process.env.APP_PROVIDING_BASIC_PROFILE || "").split(",").map((p) => p.toUpperCase());
    const claims = {};

    let commitments = undefined;

    // Add advanced scopes

    // Add basic scopes. Object keys should remain same.
    if (includingScopes.length === 0 || includingScopes.includes("phone")) {
        if (shareableProfile.includes("PHONE")) {
            claims[`phone`] = {
                [`phone_number`]: `+84${user.phone}`,
                [`phone_commitment`]: commitments ? commitments[`phone`] : undefined,
            };
        }
    }

    return claims
}

/**
 * This returns BNPL completion callback page.
 * This is called from the FI context when all the actions necessary from the FI is completed.
 *
 * You may process order status in this callback and return a completed page URL.
 *
 * @param orderId
 * @return {Promise<string>}
 */
const getBNPLCallback = async (orderId) => {
    // Do something
    // Return callback URL
    return "https://bnpl-sample.netlify.app/callback"
}

/**
 * This composes BNPL order creation payload.
 * Please check the detailed information below.
 *
 * @param req
 * @return {{totalAmount: *, orderLines: *, paymentRecipient: *, referenceId: *}}
 */
const buildOrderCreationPayload = (req) => {
    /**
     * {string}
     * @example "12345abc"
     */
    const referenceId = req.body.reference_id;

    /**
     * {Object}
     * @example
     * {
     *   "value": "9000000",
     *   "currency": "VND"
     * }
     */
    const totalAmount = req.body.total_amount; // This should be calculated on backend


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
    const orderLines = req.body.order_lines;

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
        name: "Demo Store",
        number: "190123123123",
        branch: "",
        bank: "Techcombank",
    }

    return {
        referenceId,
        totalAmount,
        orderLines,
        paymentRecipient,
    }
}
/////////////////////////////////////////////////////////////
// Private methods (please modify the following as you like.)
/////////////////////////////////////////////////////////////

/**
 * This retrieves user model from market by http request
 * The key will be either local (internal) ID
 *
 * @param localId
 * @returns {Promise<Model|null>}
 */
const getUserInfo = async (userId) => {
    const domain = process.env.URL_GET_USER_INFO || 'https://stg.api.dienthoaigiakho.vn/'

    axios
        .get(`${domain}/api/customers/${userId}/credifycheck`)
        .then(res => {
            console.log(`statusCode: ${res.status}`);
            console.log(res);
            return res
        })
        .catch(error => {
            console.error(error);
        });
}


module.exports = {
    fetchUserClaimObject,
    getBNPLCallback,
    buildOrderCreationPayload,
}
