# BNPL Skeleton Nodejs

This project demonstrates how to integrate serviceX BNPL with the simplest approach.

[Here is the documentation](https://developers.credify.one/guide/integration-guide-no-data.html).

## How to use

```shell
$ git clone https://github.com/credify-pte-ltd/bnpl-skeleton-nodejs.git
$ cd bnpl-skeleton-nodejs
$ yarn
$ yarn start
```

This exposes the following endpoints

- `[POST] /v1/orders`
  - This creates Order ID with Credify SDK and returns the Order data. You are supposed to keep this Order ID in your system for the later use.
- `[POST] /v1/simulate`
  - This simulates loan use. This is not mandatory to use. If you want to render loan summary provided through serviceX inside your platform, you can use this function. 
- `[POST] /v1/webhook`
  - This handles webhook requests from Credify. You are supposed to register this endpoint on serviceX Dashboard.
- `[POST] /v1/offers`
  - This fetches active offers for a requesting claim provider. This list is filtered with data receiver's DB.
- `[POST] /v1/api/claims/push`
  - This does not do any specific operations. Following [this spec](https://api-servicex-integration.credify.one/#tag/Markets/paths/~1api~1claims~1push/post).
- `[GET] /v1/api/bnpl/orders/:orderId/redirect`
  - This returns BNPL completion page. Service Providers redirect users to this URL when BNPL authorization is done. Check [this spec](https://api-servicex-integration.credify.one/#tag/Markets-using-BNPL/paths/~1api~1bnpl~1orders~1%7BorderId%7D~1redirect/get).


## How to use with Docker

```shell
$ docker build -t bnpl-server .
$ docker run -dp 8000:8000 bnpl-server
$ curl 'http://localhost:8000/v1'
```

## How to customize

When you integrate BNPL, please update `v1.js` to add your own logic.
