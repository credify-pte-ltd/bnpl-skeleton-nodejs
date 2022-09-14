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

This exposes 3 endpoints

- `[POST] /v1/orders`
  - This creates Order ID with Credify SDK and returns the Order data. You are supposed to keep this Order ID in your system for the later use.
- `[POST] /v1/simulate`
  - This simulates loan use. This is not mandatory to use. If you want to render loan summary provided through serviceX inside your platform, you can use this function. 
- `[POST] /v1/webhook`
  - This handles webhook requests from Credify. You are supposed to register this endpoint on serviceX Dashboard.
- `[GET] /v1/bnpl/orders/:orderId/redirect`
  - This returns BNPL completion page. Service Providers redirect users to this URL when BNPL authorization is done.


## How to customize

When you integrate BNPL, please update `v1.js` to add your own logic.
