### GET /limits/{COFIDIS_KEY}

Source: https://www.ifthenpay.com/docs/en/api/cofidispay

Retrieves the payment limits for a COFIDIS PAY client. Requires the COFIDIS_KEY in the path.

```APIDOC
## GET /limits/{COFIDIS_KEY}

### Description
Retrieves the payment limits for a COFIDIS PAY client. Requires the COFIDIS_KEY in the path.

### Method
GET

### Endpoint
/cofidis/limits/{COFIDIS_KEY}

### Parameters
#### Path Parameters
- **COFIDIS_KEY** (string) - Required - The unique key for COFIDIS PAY.

#### Query Parameters
None

#### Request Body
None

### Request Example
```
curl 'https://api.ifthenpay.com/cofidis/limits/{COFIDIS_KEY}'
```

### Response
#### Success Response (200)
- **limits** (object) - An object containing payment limits.
  - **maxAmount** (integer) - The maximum allowed payment amount.
  - **minAmount** (integer) - The minimum allowed payment amount.
- **message** (string) - Indicates the success of the operation.

#### Response Example
```json
{
  "limits": {
    "maxAmount": 1000,
    "minAmount": 60
  },
  "message": "success"
}
```
```

--------------------------------

### Payshop Callback

Source: https://www.ifthenpay.com/docs/en/guides/callback

Callback URL structure and example for Payshop payments. This URL is triggered after a successful Payshop transaction.

```APIDOC
## Payshop Callback

### Description
This endpoint is a callback URL that is triggered after a successful Payshop payment. It includes transaction details for verification.

### Method
GET

### Endpoint
`https://www.yoursite.com/callback.php`

### Query Parameters
- **anti_phishing_key** (string) - Required - The anti-phishing key that validates the authenticity of the transaction.
- **order_id** (string) - Required - The unique order ID associated with the transaction.
- **reference** (string) - Required - The Payshop reference that was used to process the payment.
- **amount** (number) - Required - The total amount of the transaction.
- **payment_datetime** (string) - Required - The date and time when the payment was made.

### Request Example
```
https://www.yoursite.com/callback.php?anti_phishing_key=my_anti_phishing_key&order_id=12345&reference=1021600051424&amount=5.00&payment_datetime=28-10-2021 10:55:21
```

### Response
#### Success Response (200)
This callback does not return a specific JSON response, but rather serves as a notification to your server with transaction details as query parameters.

#### Response Example
(No JSON response, parameters are in the URL)
```

--------------------------------

### GET /getsandbox - Request Payment Reference (Sandbox)

Source: https://www.ifthenpay.com/docs/en/api/payshop

Requests a payment reference in sandbox mode. Use this for testing.

```APIDOC
## GET /getsandbox

### Description
Request a new PAYSHOP payment reference in sandbox mode.

### Method
GET

### Endpoint
https://ifthenpay.com/api/payshop/getsandbox

### Parameters
#### Query Parameters
- **payshopkey** (string) - Required - Assigned by ifthenpay.
- **id** (string) - Required - Payment identifier defined by the client (e.g., invoice number, order number, etc.). Maximum length of 15 characters.
- **valor** (string) - Required - Amount to be paid. Decimal separator ".".
- **validade** (string) - Optional - If you require an expiration date for the payshop reference, it should be provided in the format YYYYMMDD. Can be left blank.

### Response
#### Success Response (200)
- **Code** (string) - Operation status code.
- **Message** (string) - Operation status message.
- **Reference** (string) - The generated PAYSHOP reference.
- **RequestId** (string) - Unique identifier for the request.

#### Response Example
```json
{
  "Code": "0",
  "Message": "Success",
  "Reference": "1021600051424",
  "RequestId": "3VcgFZrviWnSlTCJPLdz"
}
```
```

--------------------------------

### Successful Payment Initiation Response (JSON)

Source: https://www.ifthenpay.com/docs/en/api/ccard

This is an example of a successful response when initiating a credit card payment. It includes a success message, a payment URL for the customer to complete the transaction, and a request ID for tracking.

```json
{
  "Message": "Success",
  "PaymentUrl": "https://webkit.lemonway.fr/mb/ifthenpay/prod/?moneyintoken=2505319216xvju0GqcbrgEftsACpognW2aa",
  "RequestId": "36jvlEhUYeknQ8PHKprR",
  "Status": "0"
}
```

--------------------------------

### Get Payment Reference (GET)

Source: https://www.ifthenpay.com/docs/en/api/payshop

Retrieves a PAYSHOP payment reference using a GET request. The request can include optional parameters such as 'payshopkey', 'id', 'valor', and 'validade'. The response includes 'Code', 'Message', 'Reference', and 'RequestId'.

```curl
curl https://ifthenpay.com/api/payshop/get
```

--------------------------------

### GET /get - Request Payment Reference

Source: https://www.ifthenpay.com/docs/en/api/payshop

Requests a payment reference. This is the production endpoint.

```APIDOC
## GET /get

### Description
Request a new PAYSHOP payment reference.

### Method
GET

### Endpoint
https://ifthenpay.com/api/payshop/get

### Parameters
#### Query Parameters
- **payshopkey** (string) - Required - Assigned by ifthenpay.
- **id** (string) - Required - Payment identifier defined by the client (e.g., invoice number, order number, etc.). Maximum length of 15 characters.
- **valor** (string) - Required - Amount to be paid. Decimal separator ".".
- **validade** (string) - Optional - If you require an expiration date for the payshop reference, it should be provided in the format YYYYMMDD. Can be left blank.

### Response
#### Success Response (200)
- **Code** (string) - Operation status code.
- **Message** (string) - Operation status message.
- **Reference** (string) - The generated PAYSHOP reference.
- **RequestId** (string) - Unique identifier for the request.

#### Response Example
```json
{
  "Code": "0",
  "Message": "Success",
  "Reference": "1021600051424",
  "RequestId": "3VcgFZrviWnSlTCJPLdz"
}
```
```

--------------------------------

### MB WAY Callback

Source: https://www.ifthenpay.com/docs/en/guides/callback

Callback URL structure and example for MB WAY payments. This URL is triggered after a successful MB WAY transaction.

```APIDOC
## MB WAY Callback

### Description
This endpoint is a callback URL that is triggered after a successful MB WAY payment. It includes transaction details for verification.

### Method
GET

### Endpoint
`https://www.yoursite.com/callback.php`

### Query Parameters
- **key** (string) - Required - The anti-phishing key that validates the authenticity of the transaction.
- **orderId** (string) - Required - The unique order ID associated with the transaction.
- **amount** (number) - Required - The total amount of the transaction.
- **requestId** (string) - Required - The request ID that initiated the payment.
- **payment_datetime** (string) - Required - The date and time when the payment was made.

### Request Example
```
https://www.yoursite.com/callback.php?key=your_anti_phishing_key&orderId=1887&amount=33.61&requestId=i2szvoUfPYBMWdSxqO3n&payment_datetime=03-01-2024 15:15:16
```

### Response
#### Success Response (200)
This callback does not return a specific JSON response, but rather serves as a notification to your server with transaction details as query parameters.

#### Response Example
(No JSON response, parameters are in the URL)
```

--------------------------------

### Google Pay Callback

Source: https://www.ifthenpay.com/docs/en/guides/callback

Callback URL structure and example for Google Pay payments. This URL is triggered after a successful Google Pay transaction.

```APIDOC
## Google Pay Callback

### Description
This endpoint is a callback URL that is triggered after a successful Google Pay payment. It includes transaction details for verification.

### Method
GET

### Endpoint
`https://www.yoursite.com/callback.php`

### Query Parameters
- **key** (string) - Required - The anti-phishing key that validates the authenticity of the transaction.
- **id** (string) - Required - The order ID associated with the transaction.
- **amount** (number) - Required - The total amount of the transaction.
- **payment_datetime** (string) - Required - The date and time when the payment was made.
- **payment_method** (string) - Required - The payment method that was used to process the payment (e.g., GOOGLE).

### Request Example
```
https://www.yoursite.com/callback.php?key=my_anti_phishing_key&id=1234&amount=21.50&payment_datetime=28-10-2021 10:55:21&payment_method=GOOGLE
```

### Response
#### Success Response (200)
This callback does not return a specific JSON response, but rather serves as a notification to your server with transaction details as query parameters.

#### Response Example
(No JSON response, parameters are in the URL)
```

--------------------------------

### Credit Card Callback

Source: https://www.ifthenpay.com/docs/en/guides/callback

Callback URL structure and example for Credit Card payments. This URL is triggered after a successful Credit Card transaction.

```APIDOC
## Credit Card Callback

### Description
This endpoint is a callback URL that is triggered after a successful Credit Card payment. It includes transaction details for verification.

### Method
GET

### Endpoint
`https://www.yoursite.com/callback.php`

### Query Parameters
- **key** (string) - Required - The anti-phishing key that validates the authenticity of the transaction.
- **id** (string) - Required - The order ID associated with the transaction.
- **amount** (number) - Required - The total amount of the transaction.
- **payment_datetime** (string) - Required - The date and time when the payment was made.
- **payment_method** (string) - Required - The payment method that was used to process the payment (e.g., CCARD).

### Request Example
```
https://www.yoursite.com/callback.php?key=my_anti_phishing_key&id=1234&amount=21.50&payment_datetime=28-10-2021 10:55:21&payment_method=CCARD
```

### Response
#### Success Response (200)
This callback does not return a specific JSON response, but rather serves as a notification to your server with transaction details as query parameters.

#### Response Example
(No JSON response, parameters are in the URL)
```

--------------------------------

### Apple Pay Callback

Source: https://www.ifthenpay.com/docs/en/guides/callback

Callback URL structure and example for Apple Pay payments. This URL is triggered after a successful Apple Pay transaction.

```APIDOC
## Apple Pay Callback

### Description
This endpoint is a callback URL that is triggered after a successful Apple Pay payment. It includes transaction details for verification.

### Method
GET

### Endpoint
`https://www.yoursite.com/callback.php`

### Query Parameters
- **key** (string) - Required - The anti-phishing key that validates the authenticity of the transaction.
- **id** (string) - Required - The order ID associated with the transaction.
- **amount** (number) - Required - The total amount of the transaction.
- **payment_datetime** (string) - Required - The date and time when the payment was made.
- **payment_method** (string) - Required - The payment method that was used to process the payment (e.g., APPLEPAY).

### Request Example
```
https://www.yoursite.com/callback.php?key=my_anti_phishing_key&id=1234&amount=21.50&payment_datetime=28-10-2021 10:55:21&payment_method=APPLEPAY
```

### Response
#### Success Response (200)
This callback does not return a specific JSON response, but rather serves as a notification to your server with transaction details as query parameters.

#### Response Example
(No JSON response, parameters are in the URL)
```

--------------------------------

### Get Payshop Reference (Sandbox)

Source: https://www.ifthenpay.com/docs/en/api/payshop

Retrieves a PAYSHOP reference in sandbox mode. This endpoint does not require any specific parameters in the request body or path. The response structure is similar to the new reference request, providing status and reference details.

```shell
curl https://ifthenpay.com/api/payshop/getsandbox
```

--------------------------------

### GET /getPayments

Source: https://www.ifthenpay.com/docs/en/api/list-of-payments

Retrieve a list of all payments matching specified criteria in SOAP format.

```APIDOC
## GET /getPayments

### Description
Retrieve a list of all payments matching the specified criteria in SOAP (1.1 and 1.2) format.

### Method
GET

### Endpoint
https://ifthenpay.com/ifmbws/ifmbws.asmx/getPayments

### Parameters
#### Query Parameters
- **chavebackoffice** (string) - Required - Key provided by ifthenpay when signing the contract. Default: "0000-0000-0000-0000"
- **entidade** (string) - Required - Entity (5 digits) or MB or MBWAY or PAYSHOP or CCARD or COFIDIS or GOOGLE or APPLE or PIX or TPA. Default: 11604
- **subentidade** (string) - Required - Subentity (3 digits) or MB KEY or MBWAY Key or PAYSHOP KEY or CCARD KEY or COFIDIS KEY or GOOGLE KEY or APPLE KEY or PIX KEY or TPA KEY. Default: 999
- **dtHrInicio** (string) - Required - Start date/time of the desired payments in the format dd-MM-yyyy HH:mm. Default: "23-05-2012 00:00:00"
- **dtHrFim** (string) - Required - End date/time of the desired payments in the format dd-MM-yyyy HH:mm. Default: "23-05-2012 23:59:59"
- **referencia** (string) - Required - Unique payment reference for Multibanco and Payshop; for other methods, it matches the orderId. This field can be left blank. Default: " "
- **Valor** (double) - Required - Amount in euros. Decimal separator ".". Default: " "
- **sandbox** (string) - Required - Should indicate 1 or 0 depending on whether or not the test platform is used. Default: 0

### Request Example
```bash
curl 'https://ifthenpay.com/ifmbws/ifmbws.asmx/getPayments?chavebackoffice=0000-0000-0000-0000&entidade=11604&subentidade=999&dtHrInicio=23-05-2012%2000%3A00%3A00&dtHrFim=23-05-2012%2023%3A59%3A59&referencia=%20&Valor=%20&sandbox=0'
```

### Response
#### Success Response (200)
- **SOAP Response** - A string containing the payment data in XML format, conforming to SOAP 1.1 or 1.2 standards.
```

--------------------------------

### GET /getPaymentsJsonV2

Source: https://www.ifthenpay.com/docs/en/api/list-of-payments

Retrieve a list of all payments matching specified criteria in JSON format.

```APIDOC
## GET /getPaymentsJsonV2

### Description
Retrieve a list of all payments matching the specified criteria in JSON format.

### Method
GET

### Endpoint
https://ifthenpay.com/ifmbws/ifmbws.asmx/getPaymentsJsonV2

### Parameters
#### Query Parameters
- **chavebackoffice** (string) - Required - Key provided by ifthenpay when signing the contract. Default: "0000-0000-0000-0000"
- **entidade** (string) - Required - Entity (5 digits) or MB or MBWAY or PAYSHOP or CCARD or COFIDIS or GOOGLE or APPLE or PIX or TPA. Default: 11604
- **subentidade** (string) - Required - Subentity (3 digits) or MB KEY or MBWAY Key or PAYSHOP KEY or CCARD KEY or COFIDIS KEY or GOOGLE KEY or APPLE KEY or PIX KEY or TPA KEY. Default: 999
- **dtHrInicio** (string) - Required - Start date/time of the desired payments in the format dd-MM-yyyy HH:mm. Default: "23-05-2012 00:00:00"
- **dtHrFim** (string) - Required - End date/time of the desired payments in the format dd-MM-yyyy HH:mm. Default: "23-05-2012 23:59:59"
- **referencia** (string) - Required - Unique payment reference for Multibanco and Payshop; for other methods, it matches the orderId. This field can be left blank. Default: " "
- **Valor** (double) - Required - Amount in euros. Decimal separator ".". Default: " "
- **sandbox** (string) - Required - Should indicate 1 or 0 depending on whether or not the test platform is used. Default: 0

### Response
#### Success Response (200)
- **JSON Response** - An object containing the payment data in JSON format.
```

--------------------------------

### GET /api/payshop/getsandbox

Source: https://www.ifthenpay.com/docs/en/api/payshop

Retrieve information related to sandbox payment references. This endpoint is used to check the status or details of a sandbox payment reference.

```APIDOC
## GET /api/payshop/getsandbox

### Description
Retrieve information related to sandbox payment references. This endpoint is used to check the status or details of a sandbox payment reference.

### Method
GET

### Endpoint
https://ifthenpay.com/api/payshop/getsandbox

### Parameters
*Note: This endpoint does not appear to have explicit parameters in the provided text, but typically would accept a reference ID or similar.* 

### Request Example
```bash
curl https://ifthenpay.com/api/payshop/getsandbox
```

### Response
#### Success Response (200)
- **Code** (string) - Indicates the status of the operation.
- **Message** (string) - A message describing the result of the operation.
- **Reference** (string) - The payment reference number.
- **RequestId** (string) - A unique identifier for the request.

#### Response Example
```json
{
  "Code": "0",
  "Message": "Success",
  "Reference": "1021600051424",
  "RequestId": "3VcgFZrviWnSlTCJPLdz"
}
```
```

--------------------------------

### GET /getPaymentsXml

Source: https://www.ifthenpay.com/docs/en/api/list-of-payments

Retrieve a list of all payments matching specified criteria in XML format.

```APIDOC
## GET /getPaymentsXml

### Description
Retrieve a list of all payments matching the specified criteria in XML format.

### Method
GET

### Endpoint
https://ifthenpay.com/ifmbws/ifmbws.asmx/getPaymentsXml

### Parameters
#### Query Parameters
- **chavebackoffice** (string) - Required - Key provided by ifthenpay when signing the contract. Default: "0000-0000-0000-0000"
- **entidade** (string) - Required - Entity (5 digits) or MB or MBWAY or PAYSHOP or CCARD or COFIDIS or GOOGLE or APPLE or PIX or TPA. Default: 11604
- **subentidade** (string) - Required - Subentity (3 digits) or MB KEY or MBWAY Key or PAYSHOP KEY or CCARD KEY or COFIDIS KEY or GOOGLE KEY or APPLE KEY or PIX KEY or TPA KEY. Default: 999
- **dtHrInicio** (string) - Required - Start date/time of the desired payments in the format dd-MM-yyyy HH:mm. Default: "23-05-2012 00:00:00"
- **dtHrFim** (string) - Required - End date/time of the desired payments in the format dd-MM-yyyy HH:mm. Default: "23-05-2012 23:59:59"
- **referencia** (string) - Required - Unique payment reference for Multibanco and Payshop; for other methods, it matches the orderId. This field can be left blank. Default: " "
- **Valor** (double) - Required - Amount in euros. Decimal separator ".". Default: " "
- **sandbox** (string) - Required - Should indicate 1 or 0 depending on whether or not the test platform is used. Default: 0

### Request Example
```bash
curl 'https://ifthenpay.com/ifmbws/ifmbws.asmx/getPaymentsXml?chavebackoffice=0000-0000-0000-0000&entidade=11604&subentidade=999&dtHrInicio=23-05-2012%2000%3A00%3A00&dtHrFim=23-05-2012%2023%3A59%3A59&referencia=%20&Valor=%20&sandbox=0'
```

### Response
#### Success Response (200)
- **XML Response** - A string containing the payment data in XML format.
```

--------------------------------

### GET /getPayments

Source: https://www.ifthenpay.com/docs/en/api/list-of-payments

Retrieve a list of all payments matching the specified criteria in SOAP (1.1 and 1.2) format. If no parameters are provided, the 1,000 most recent payments are returned.

```APIDOC
## GET /getPayments

### Description
Retrieve a list of all payments matching the specified criteria in SOAP (1.1 and 1.2) format. If no parameters are provided, the 1,000 most recent payments are returned.

### Method
GET

### Endpoint
https://ifthenpay.com/ifmbws/ifmbws.asmx/getPayments

### Parameters
#### Query Parameters
- **chavebackoffice** (string) - Required - Key provided by ifthenpay when signing the contract. Default: "0000-0000-0000-0000"
- **entidade** (string) - Optional - Entity (5 digits) or MB or MBWAY or PAYSHOP or CCARD or COFIDIS or GOOGLE or APPLE or PIX or TPA. Default: 11604
- **subentidade** (string) - Optional - Subentity (3 digits) or MB KEY or MBWAY Key or PAYSHOP KEY or CCARD KEY or COFIDIS KEY or GOOGLE KEY or APPLE KEY or PIX KEY or TPA KEY. Default: 999
- **dtHrInicio** (string) - Optional - Start date/time of the desired payments in the format dd-MM-yyyy HH:mm. Default: "23-05-2012 00:00:00"
- **dtHrFim** (string) - Optional - End date/time of the desired payments in the format dd-MM-yyyy HH:mm. Default: "23-05-2012 23:59:59"
- **referencia** (string) - Optional - Unique payment reference for Multibanco and Payshop; for other methods, it matches the orderId. Default: " "
- **Valor** (double) - Optional - Amount in euros. Decimal separator ".". Default: " "
- **sandbox** (string) - Required - Should indicate 1 or 0 depending on whether or not the test platform is used. Default: 0

### Response
#### Success Response (200)
Returns a list of payments in SOAP format (1.1 and 1.2). The structure will be enclosed in SOAP envelopes.

#### Response Example
```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getPaymentsResponse xmlns="http://ifthenpay.com/">
      <getPaymentsResult>
        <ArrayOfPagamentos xmlns="http://ifthenpay.com/">
          <Pagamentos>
            <Entidade>11604</Entidade>
            <SubEntidade>999</SubEntidade>
            <Referencia>0</Referencia>
            <Valor>63,35</Valor>
            <Id>1234</Id>
            <DtHrPagamento>23-05-2012 09:31:13</DtHrPagamento>
            <Processamento>201205231</Processamento>
            <Terminal>5-0000000000-CAIXA GERAL DE DEPOSITOS</Terminal>
            <Tarifa>0,62</Tarifa>
            <ValorLiquido>62,73</ValorLiquido>
            <CodigoErro>0</CodigoErro>
            <MensagemErro></MensagemErro>
            <Imagem></Imagem>
          </Pagamentos>
        </ArrayOfPagamentos>
      </getPaymentsResult>
    </getPaymentsResponse>
  </soap:Body>
</soap:Envelope>
```
```

--------------------------------

### GET /getPaymentsJsonV2

Source: https://www.ifthenpay.com/docs/en/api/list-of-payments

Retrieve a list of all payments matching the specified criteria in JSON format. If no parameters are provided, the 1,000 most recent payments are returned.

```APIDOC
## GET /getPaymentsJsonV2

### Description
Retrieve a list of all payments matching the specified criteria in JSON format. If no parameters are provided, the 1,000 most recent payments are returned.

### Method
GET

### Endpoint
https://ifthenpay.com/ifmbws/ifmbws.asmx/getPaymentsJsonV2

### Parameters
#### Query Parameters
- **chavebackoffice** (string) - Required - Key provided by ifthenpay when signing the contract. Default: "0000-0000-0000-0000"
- **entidade** (string) - Optional - Entity (5 digits) or MB or MBWAY or PAYSHOP or CCARD or COFIDIS or GOOGLE or APPLE or PIX or TPA. Default: 11604
- **subentidade** (string) - Optional - Subentity (3 digits) or MB KEY or MBWAY Key or PAYSHOP KEY or CCARD KEY or COFIDIS KEY or GOOGLE KEY or APPLE KEY or PIX KEY or TPA KEY. Default: 999
- **dtHrInicio** (string) - Optional - Start date/time of the desired payments in the format dd-MM-yyyy HH:mm. Default: "23-05-2012 00:00:00"
- **dtHrFim** (string) - Optional - End date/time of the desired payments in the format dd-MM-yyyy HH:mm. Default: "23-05-2012 23:59:59"
- **referencia** (string) - Optional - Unique payment reference for Multibanco and Payshop; for other methods, it matches the orderId. Default: " "
- **Valor** (double) - Optional - Amount in euros. Decimal separator ".". Default: " "
- **sandbox** (string) - Required - Should indicate 1 or 0 depending on whether or not the test platform is used. Default: 0

### Request Example
```curl
curl 'https://ifthenpay.com/ifmbws/ifmbws.asmx/getPaymentsJsonV2?chavebackoffice=0000-0000-0000-0000&entidade=11604&subentidade=999&dtHrInicio=23-05-2012%2000%3A00%3A00&dtHrFim=23-05-2012%2023%3A59%3A59&referencia=%20&Valor=%20&sandbox=0'
```

### Response
#### Success Response (200)
- **Entidade** (integer) - The entity number.
- **SubEntidade** (integer) - The subentity number.
- **Referencia** (integer) - The payment reference.
- **Valor** (string) - The payment amount in euros, with a comma as the decimal separator.
- **Id** (integer) - The unique identifier for the payment.
- **DtHrPagamento** (string) - The date and time of the payment in dd-MM-yyyy HH:mm:ss format.
- **Processamento** (integer) - The processing identifier.
- **Terminal** (string) - Information about the terminal used for the payment.
- **Tarifa** (string) - The fee associated with the payment, with a comma as the decimal separator.
- **ValorLiquido** (string) - The net amount after fees, with a comma as the decimal separator.
- **CodigoErro** (string) - Error code, "0" indicates success.
- **MensagemErro** (string) - Error message, empty if successful.
- **Imagem** (null) - Placeholder for image data, currently null.

#### Response Example
```json
[
  {
    "Entidade": 11604,
    "SubEntidade": 999,
    "Referencia": 0,
    "Valor": "63,35",
    "Id": 1234,
    "DtHrPagamento": "23-05-2012 09:31:13",
    "Processamento": 201205231,
    "Terminal": "5-0000000000-CAIXA GERAL DE DEPOSITOS",
    "Tarifa": "0,62",
    "ValorLiquido": "62,73",
    "CodigoErro": "0",
    "MensagemErro": "",
    "Imagem": null
  }
]
```
```

--------------------------------

### GET /getPaymentsXml

Source: https://www.ifthenpay.com/docs/en/api/list-of-payments

Retrieve a list of all payments matching the specified criteria in XML format. If no parameters are provided, the 1,000 most recent payments are returned.

```APIDOC
## GET /getPaymentsXml

### Description
Retrieve a list of all payments matching the specified criteria in XML format. If no parameters are provided, the 1,000 most recent payments are returned.

### Method
GET

### Endpoint
https://ifthenpay.com/ifmbws/ifmbws.asmx/getPaymentsXml

### Parameters
#### Query Parameters
- **chavebackoffice** (string) - Required - Key provided by ifthenpay when signing the contract. Default: "0000-0000-0000-0000"
- **entidade** (string) - Optional - Entity (5 digits) or MB or MBWAY or PAYSHOP or CCARD or COFIDIS or GOOGLE or APPLE or PIX or TPA. Default: 11604
- **subentidade** (string) - Optional - Subentity (3 digits) or MB KEY or MBWAY Key or PAYSHOP KEY or CCARD KEY or COFIDIS KEY or GOOGLE KEY or APPLE KEY or PIX KEY or TPA KEY. Default: 999
- **dtHrInicio** (string) - Optional - Start date/time of the desired payments in the format dd-MM-yyyy HH:mm. Default: "23-05-2012 00:00:00"
- **dtHrFim** (string) - Optional - End date/time of the desired payments in the format dd-MM-yyyy HH:mm. Default: "23-05-2012 23:59:59"
- **referencia** (string) - Optional - Unique payment reference for Multibanco and Payshop; for other methods, it matches the orderId. Default: " "
- **Valor** (double) - Optional - Amount in euros. Decimal separator ".". Default: " "
- **sandbox** (string) - Required - Should indicate 1 or 0 depending on whether or not the test platform is used. Default: 0

### Response
#### Success Response (200)
Returns a list of payments in XML format. The structure will be similar to the JSON response but enclosed in XML tags.

#### Response Example
```xml
<ArrayOfPagamentos>
  <Pagamentos>
    <Entidade>11604</Entidade>
    <SubEntidade>999</SubEntidade>
    <Referencia>0</Referencia>
    <Valor>63,35</Valor>
    <Id>1234</Id>
    <DtHrPagamento>23-05-2012 09:31:13</DtHrPagamento>
    <Processamento>201205231</Processamento>
    <Terminal>5-0000000000-CAIXA GERAL DE DEPOSITOS</Terminal>
    <Tarifa>0,62</Tarifa>
    <ValorLiquido>62,73</ValorLiquido>
    <CodigoErro>0</CodigoErro>
    <MensagemErro></MensagemErro>
    <Imagem></Imagem>
  </Pagamentos>
</ArrayOfPagamentos>
```
```

--------------------------------

### Retrieve Payments List in JSON Format (API Endpoint)

Source: https://www.ifthenpay.com/docs/en/api/list-of-payments

Retrieves a list of all payments matching specified criteria in JSON format via a GET request to the /getPaymentsJsonV2 endpoint. Requires authentication key, entity, subentity, date/time range, and optional payment details. The sandbox parameter controls test environment usage.

```json
GET https://ifthenpay.com/ifmbws/ifmbws.asmx/getPaymentsJsonV2?chavebackoffice=0000-0000-0000-0000&entidade=11604&subentidade=999&dtHrInicio=23-05-2012%2000%3A00%3A00&dtHrFim=23-05-2012%2023%3A59%3A59&referencia=%20&Valor=%20&sandbox=0
```

--------------------------------

### GET /mbway/status - Check Payment Status

Source: https://www.ifthenpay.com/docs/en/api/mbway

Retrieves the current status of an MB WAY payment using the RequestId obtained from the payment initiation.

```APIDOC
## GET /mbway/status

### Description
Check the status of an MB WAY payment.

### Method
GET

### Endpoint
https://api.ifthenpay.com/spg/payment/mbway/status

### Parameters
#### Query Parameters
- **mbWayKey** (string) - Required - The MBWAY KEY assigned by ifthenpay.
- **requestId** (string) - Required - The unique identifier obtained from the payment request response.

### Request Example
```
curl 'https://api.ifthenpay.com/spg/payment/mbway/status?mbWayKey=ZZZ-000000&requestId=i2szvoUfPYBMWdSxqO3n'
```

### Response
#### Success Response (200)
- **CreatedAt** (string) - The timestamp when the payment was created.
- **Message** (string) - The status message (e.g., "Success").
- **RequestId** (string) - The unique identifier for the payment request.
- **Status** (string) - The status code of the operation (e.g., "000").
- **UpdateAt** (string) - The timestamp when the payment status was last updated.

#### Response Example
```json
{
  "CreatedAt": "03-01-2024 15:15:06",
  "Message": "Success",
  "RequestId": "i2szvoUfPYBMWdSxqO3n",
  "Status": "000",
  "UpdateAt": "03-01-2024 15:15:16"
}
```
```

--------------------------------

### POST /sandbox/init/{CCARD_KEY}

Source: https://www.ifthenpay.com/docs/en/api/ccard

Requests a new CREDIT CARD payment in sandbox mode. Replace {CCARD_KEY} with the key provided by ifthenpay.

```APIDOC
## POST /sandbox/init/{CCARD_KEY}

### Description
Requests a new CREDIT CARD payment in sandbox mode. Replace {CCARD_KEY} with the key provided by ifthenpay. Use the 'CCARD TEST KEY' for testing.

### Method
POST

### Endpoint
https://api.ifthenpay.com/creditcard/sandbox/init/{CCARD_KEY}

### Parameters
#### Path Parameters
- **CCARD_KEY** (string) - Required - The CCARD TEST KEY provided by ifthenpay for sandbox environment.

### Request Body
(No specific request body documented, but typically includes order details like amount, order ID, and callback URLs)

### Request Example
```json
{
  "orderId": "order_45678",
  "amount": 11.55,
  "callbackUrl": "https://youraddress.com/status.php"
}
```

### Response
#### Success Response (200)
(Response details not explicitly provided, but typically includes a payment initiation URL or token)

#### Response Example
(No specific response example provided)

### Sandbox Credit Card Numbers
**Success**
Number: 4012 0010 3714 1112
CVC: 212
Expiration: 12/27

**Error**
Number: 4761 7390 0101 0135
CVC: 608
Expiration: 12/29
```

--------------------------------

### POST /init/{COFIDIS_KEY}

Source: https://www.ifthenpay.com/docs/en/api/cofidispay

Initiates a new COFIDIS PAY payment. Requires a COFIDIS_KEY in the path and a JSON body containing payment details.

```APIDOC
## POST /init/{COFIDIS_KEY}

### Description
Initiates a new COFIDIS PAY payment. Requires a COFIDIS_KEY in the path and a JSON body containing payment details.

### Method
POST

### Endpoint
/cofidis/init/{COFIDIS_KEY}

### Parameters
#### Path Parameters
- **COFIDIS_KEY** (string) - Required - The unique key for COFIDIS PAY.

#### Query Parameters
None

#### Request Body
- **amount** (string) - Required - The payment amount (e.g., "11.55").
- **orderId** (string) - Required - A unique identifier for the order (max 15 characters).
- **returnUrl** (string) - Required - The URL to redirect the customer after payment confirmation or failure.
- **billingAddress** (string) - Optional - The billing street address.
- **billingCity** (string) - Optional - The billing city.
- **billingZipCode** (string) - Optional - The billing postal or ZIP code.
- **customerEmail** (string) - Optional - The customer's email address.
- **customerName** (string) - Optional - The full name of the customer.
- **customerPhone** (string) - Optional - The customer's phone number.
- **customerVat** (string) - Optional - The customer's VAT number.
- **deliveryAddress** (string) - Optional - The delivery street address.
- **deliveryCity** (string) - Optional - The delivery city.

### Request Example
```json
{
  "orderId": "order_45678",
  "amount": "11.55",
  "returnUrl": "https://youraddress.com/status.php",
  "description": "Order 45678",
  "customerName": "John Doe",
  "customerVat": "123456789",
  "customerEmail": "johndoe@example.com",
  "customerPhone": "+351256245560",
  "billingAddress": "123 Main Street",
  "billingZipCode": "12345",
  "billingCity": "New York",
  "deliveryAddress": "456 Elm Street",
  "deliveryZipCode": "67890",
  "deliveryCity": "Los Angeles"
}
```

### Response
#### Success Response (200)
- **message** (string) - Indicates the success of the operation.
- **paymentUrl** (string) - The URL for the payment gateway.
- **requestId** (string) - A unique identifier for the payment request.
- **status** (string) - The status code of the operation.

#### Response Example
```json
{
  "message": "Success",
  "paymentUrl": "https://gateway.ifthenpay.com/?moneyintoken=2505319216xvju0GqcbrgEftsACpognW2aa",
  "requestId": "36jvlEhUYeknQ8PHKprR",
  "status": "0"
}
```
```

--------------------------------

### POST /init/{CCARD_KEY}

Source: https://www.ifthenpay.com/docs/en/api/ccard

Initiates a new CREDIT CARD payment. Requires a CCARD_KEY and provides details for amount, redirection URLs, order ID, and language.

```APIDOC
## POST /init/{CCARD_KEY}

### Description
Initiates a new CREDIT CARD payment. This endpoint requires a unique `CCARD_KEY` and accepts payment details such as amount, redirection URLs for success, error, and cancellation, a unique order identifier, and the preferred language for the payment interface.

### Method
POST

### Endpoint
`/init/{CCARD_KEY}`

### Parameters
#### Path Parameters
- **CCARD_KEY** (string) - Required - A unique key for credit card transactions.

#### Query Parameters
None

#### Request Body
- **amount** (string) - Required - The payment amount, using '.' as the decimal separator. Example: `"11.55"
- **cancelUrl** (string) - Required - The URL to redirect the customer if the transaction is canceled. Example: `"https://youraddress.com/cancel.php"
- **errorUrl** (string) - Required - The URL to redirect the customer in case of an error preventing transaction completion. Example: `"https://youraddress.com/error.php"
- **orderId** (string) - Required - A client-defined payment identifier (e.g., invoice number, order number). Maximum length of 15 characters. Example: `"order_45678"
- **successUrl** (string) - Required - The URL for payment confirmation. The customer is redirected here upon successful payment. Example: `"https://youraddress.com/sucess.php"
- **language** (string) - Optional - The language presented to the customer during card detail entry. Defaults to 'en'. Example: `"en"

### Request Example
```json
{
  "orderId": "order_45678",
  "amount": "11.55",
  "successUrl": "https://youraddress.com/sucess.php",
  "errorUrl": "https://youraddress.com/error.php",
  "cancelUrl": "https://youraddress.com/cancel.php",
  "language": "en"
}
```

### Response
#### Success Response (200)
- **Message** (string) - Indicates the status of the operation. Example: `"Success"
- **PaymentUrl** (string) - The URL where the payment process will be continued. Example: `"https://webkit.lemonway.fr/mb/ifthenpay/prod/?moneyintoken=2505319216xvju0GqcbrgEftsACpognW2aa"
- **RequestId** (string) - A unique identifier for the request. Example: `"36jvlEhUYeknQ8PHKprR"
- **Status** (string) - A status code for the operation. Example: `"0"

#### Response Example
```json
{
  "Message": "Success",
  "PaymentUrl": "https://webkit.lemonway.fr/mb/ifthenpay/prod/?moneyintoken=2505319216xvju0GqcbrgEftsACpognW2aa",
  "RequestId": "36jvlEhUYeknQ8PHKprR",
  "Status": "0"
}
```
```

--------------------------------

### POST /init/{CCARD_KEY}

Source: https://www.ifthenpay.com/docs/en/api/ccard

Requests a new CREDIT CARD payment. Replace {CCARD_KEY} with the key provided by ifthenpay.

```APIDOC
## POST /init/{CCARD_KEY}

### Description
Requests a new CREDIT CARD payment. Replace {CCARD_KEY} with the key provided by ifthenpay.

### Method
POST

### Endpoint
https://api.ifthenpay.com/creditcard/init/{CCARD_KEY}

### Parameters
#### Path Parameters
- **CCARD_KEY** (string) - Required - The CCARD KEY provided by ifthenpay.

### Request Body
(No specific request body documented, but typically includes order details like amount, order ID, and callback URLs)

### Request Example
```json
{
  "orderId": "order_45678",
  "amount": 11.55,
  "callbackUrl": "https://youraddress.com/status.php"
}
```

### Response
#### Success Response (200)
(Response details not explicitly provided, but typically includes a payment initiation URL or token)

#### Response Example
(No specific response example provided)
```

--------------------------------

### Initiate PIX Payment Request (Shell Curl)

Source: https://www.ifthenpay.com/docs/en/api/pix

This snippet demonstrates how to initiate a new PIX payment using a cURL command. It requires the PIX_KEY as a path parameter and a JSON body containing payment details such as amount, customer information, and redirect URL. The response includes a payment URL and QR code value.

```shell
curl 'https://api.ifthenpay.com/pix/init/{PIX_KEY}' \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "orderId": "order_45678",
  "amount": "11.55",
  "redirectUrl": "https://youraddress.com/status.php",
  "description": "Order 45678",
  "customerName": "John Doe",
  "customerCpf": "74026594025",
  "customerEmail": "johndoe@example.com",
  "customerPhone": "+351256245560",
  "customerAddress": "Main Street",
  "customerStreetNumber": "123",
  "customerZipCode": "12345",
  "customerCity": "New York",
  "customerState": "New York"
}'
```

--------------------------------

### Initiate Credit Card Payment Request (Shell Curl)

Source: https://www.ifthenpay.com/docs/en/api/ccard

This snippet demonstrates how to initiate a credit card payment using a cURL command. It includes the API endpoint, HTTP method, and a JSON payload with payment details like order ID, amount, success, error, and cancel URLs, and language.

```shell
curl 'https://api.ifthenpay.com/creditcard/init/{CCARD_KEY}' \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "orderId": "order_45678",
  "amount": "11.55",
  "successUrl": "https://youraddress.com/sucess.php",
  "errorUrl": "https://youraddress.com/error.php",
  "cancelUrl": "https://youraddress.com/cancel.php",
  "language": "en"
}'
```

--------------------------------

### Initiate New Payment

Source: https://www.ifthenpay.com/docs/en/api/pix

Initiates a new PIX payment with the provided details.

```APIDOC
## POST /pix/init/{PIX_KEY}

### Description
Initiates a new PIX payment.

### Method
POST

### Endpoint
`/pix/init/{PIX_KEY}`

### Parameters
#### Path Parameters
- **PIX_KEY** (string) - Required - The PIX key for the payment.

#### Query Parameters
None

#### Request Body
- **amount** (string) - Required - The payment amount (e.g., "11.55").
- **customerCpf** (string) - Required - The customer's CPF number (max 20 characters).
- **customerEmail** (string) - Required - The customer's email address (max 250 characters).
- **customerName** (string) - Required - The customer's full name (max 150 characters).
- **customerPhone** (string) - Required - The customer's phone number (max 20 characters).
- **orderId** (string) - Required - A unique identifier for the order (max 25 characters).
- **redirectUrl** (string) - Required - The URL to redirect the customer after payment.
- **customerAddress** (string) - Optional - The customer's street address (max 250 characters).
- **customerCity** (string) - Optional - The customer's city (max 50 characters).
- **customerState** (string) - Optional - The customer's state (max 50 characters).
- **customerStreetNumber** (string) - Optional - The customer's street number (max 20 characters).
- **customerZipCode** (string) - Optional - The customer's postal or ZIP code (max 20 characters).

### Request Example
```json
{
  "orderId": "order_45678",
  "amount": "11.55",
  "redirectUrl": "https://youraddress.com/status.php",
  "description": "Order 45678",
  "customerName": "John Doe",
  "customerCpf": "74026594025",
  "customerEmail": "johndoe@example.com",
  "customerPhone": "+351256245560",
  "customerAddress": "Main Street",
  "customerStreetNumber": "123",
  "customerZipCode": "12345",
  "customerCity": "New York",
  "customerState": "New York"
}
```

### Response
#### Success Response (200)
- **message** (string) - Indicates the success of the operation.
- **paymentUrl** (string) - The URL for the payment.
- **qrCodeValue** (string) - The PIX QR code value.
- **requestId** (string) - A unique identifier for the request.
- **status** (string) - The status of the payment.

#### Response Example
```json
{
  "message": "Success",
  "paymentUrl": "https://gateway.ifthenpay.com/?moneyintoken=2505319216xvju0GqcbrgEftsACpognW2aa",
  "qrCodeValue": "00020126680014br.gov.bcb.pix0136<your-pix-key-here>5204000053039865405<amount>5802BR5925<merchant-name-here>6009SAO PAULO6108BR1234567203<txid>6304<checksum>",
  "requestId": "36jvlEhUYeknQ8PHKprR",
  "status": "0"
}
```
```

--------------------------------

### Create Payment Link with Simple Checkout Link (HTML)

Source: https://www.ifthenpay.com/docs/en/guides/simple-checkout

This snippet demonstrates creating a simple HTML hyperlink that directs users to the IfThenPay payment gateway. The anchor tag's href attribute contains the Simple Checkout URL. This method provides a text-based payment link. No external dependencies are needed.

```html
<a href="https://gateway.ifthenpay.com/?token=NXXX-999999&id=10501&amount=10.50&description=Order+No.+2010501&expire=20251029&lang=EN" target="_blank">Pay Now</a>
```

--------------------------------

### PIX Payment Initiation

Source: https://www.ifthenpay.com/docs/en/api/pix

Initiates a new PIX payment request. Requires a valid PIX KEY and customer details for sandbox mode.

```APIDOC
## POST /init/{PIX_KEY}

### Description
Requests a new PIX payment. Replace `{PIX_KEY}` with your assigned PIX KEY.

### Method
POST

### Endpoint
/init/{PIX_KEY}

### Parameters
#### Path Parameters
- **PIX_KEY** (string) - Required - The PIX KEY assigned by Ifthenpay.

#### Query Parameters
None

#### Request Body
- **customer** (object) - Required - Customer details for the payment.
  - **name** (string) - Required - Customer's full name.
  - **address** (string) - Required - Customer's address.
  - **city** (string) - Required - Customer's city.
  - **state** (string) - Required - Customer's state.
  - **cep** (string) - Required - Customer's postal code (CEP).
  - **phone** (string) - Required - Customer's phone number.
  - **CPF** (string) - Required - Customer's CPF number (Cadastro de Pessoas Físicas).

### Request Example
```json
{
  "customer": {
    "name": "Ana Santos Araujo",
    "address": "Rua E, 10409",
    "city": "Maracanaú",
    "state": "CE",
    "cep": "61919-230",
    "phone": "(85) 2284-7035",
    "CPF": "853.513.468-93"
  }
}
```

### Response
#### Success Response (200)
- **payment_id** (string) - The unique identifier for the payment request.
- **payment_url** (string) - The URL to complete the PIX payment.

#### Response Example
```json
{
  "payment_id": "some_payment_id",
  "payment_url": "https://api.ifthenpay.com/pix/payment/some_payment_id"
}
```
```

--------------------------------

### Create Payment Button with Simple Checkout Link (HTML)

Source: https://www.ifthenpay.com/docs/en/guides/simple-checkout

This snippet shows how to create an HTML button that redirects users to the IfThenPay payment gateway. It uses an anchor tag with an href attribute pointing to the Simple Checkout URL. The button is styled for better visibility. No external dependencies are required.

```html
<a href="https://gateway.ifthenpay.com/?token=NXXX-999999&id=10501&amount=10.50&description=Order+No.+2010501&expire=20251029&lang=EN" target="_blank">
<button style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Pay Now</button>
</a>
```

--------------------------------

### POST /{GATEWAY_KEY}/{REQUEST_STATUS}

Source: https://www.ifthenpay.com/docs/en/api/pbl

Enables or disables the pay by link and PIN PAY services for a given GATEWAY KEY. Use 'enable' or 'disable' as the REQUEST_STATUS.

```APIDOC
## POST /{GATEWAY_KEY}/{REQUEST_STATUS}

### Description
Enables or disables the pay by link and PIN PAY services for a given GATEWAY KEY. Use 'enable' or 'disable' as the REQUEST_STATUS.

### Method
POST

### Endpoint
/{GATEWAY_KEY}/{REQUEST_STATUS}

### Parameters
#### Path Parameters
- **GATEWAY_KEY** (string) - Required - The unique GATEWAY KEY provided by ifthenpay.
- **REQUEST_STATUS** (string) - Required - The status to set for the service ('enable' or 'disable').

### Request Example
```json
{
  "some_field": "some_value"
}
```

### Response
#### Success Response (200)
- **status** (string) - Indicates the success or failure of the request.
- **message** (string) - A message providing details about the response.

#### Response Example
```json
{
  "status": "success",
  "message": "Pay by link and PIN PAY services status updated successfully."
}
```
```

--------------------------------

### Initiate Cofidis PAY Payment

Source: https://www.ifthenpay.com/docs/en/api/cofidispay

Initiates a new Cofidis PAY payment by sending payment details such as amount, order ID, return URL, and customer information. Requires a COFIDIS_KEY in the path and a JSON body. Returns a payment URL upon successful initiation.

```shell
curl 'https://api.ifthenpay.com/cofidis/init/{COFIDIS_KEY}' \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "orderId": "order_45678",
  "amount": "11.55",
  "returnUrl": "https://youraddress.com/status.php",
  "description": "Order 45678",
  "customerName": "John Doe",
  "customerVat": "123456789",
  "customerEmail": "johndoe@example.com",
  "customerPhone": "+351256245560",
  "billingAddress": "123 Main Street",
  "billingZipCode": "12345",
  "billingCity": "New York",
  "deliveryAddress": "456 Elm Street",
  "deliveryZipCode": "67890",
  "deliveryCity": "Los Angeles"
}'
```

--------------------------------

### POST /sandbox - Request New Payment Reference (Sandbox)

Source: https://www.ifthenpay.com/docs/en/api/payshop

Requests a new PAYSHOP payment reference in sandbox mode. Use this for testing.

```APIDOC
## POST /sandbox

### Description
Request a new PAYSHOP payment reference in sandbox mode.

### Method
POST

### Endpoint
https://ifthenpay.com/api/payshop/sandbox

### Parameters
#### Query Parameters
- **payshopkey** (string) - Required - Assigned by ifthenpay.
- **id** (string) - Required - Payment identifier defined by the client (e.g., invoice number, order number, etc.). Maximum length of 15 characters.
- **valor** (string) - Required - Amount to be paid. Decimal separator ".".
- **validade** (string) - Optional - If you require an expiration date for the payshop reference, it should be provided in the format YYYYMMDD. Can be left blank.

### Request Body
```json
{
  "payshopkey": "XXX-000000",
  "id": "12345",
  "valor": "5.00",
  "validade": "20301231"
}
```

### Response
#### Success Response (200)
- **Code** (string) - Operation status code.
- **Message** (string) - Operation status message.
- **Reference** (string) - The generated PAYSHOP reference.
- **RequestId** (string) - Unique identifier for the request.

#### Response Example
```json
{
  "Code": "0",
  "Message": "Success",
  "Reference": "1021600051424",
  "RequestId": "3VcgFZrviWnSlTCJPLdz"
}
```
```

--------------------------------

### Initiate PIX Payment Response Schema (JSON)

Source: https://www.ifthenpay.com/docs/en/api/pix

This is the JSON schema for a successful PIX payment initiation response. It includes a success message, a payment URL, a QR code value for payment, a request ID, and a status code.

```json
{
  "message": "Success",
  "paymentUrl": "https://gateway.ifthenpay.com/?moneyintoken=2505319216xvju0GqcbrgEftsACpognW2aa",
  "qrCodeValue": "00020126680014br.gov.bcb.pix0136<your-pix-key-here>5204000053039865405<amount>5802BR5925<merchant-name-here>6009SAO PAULO6108BR1234567203<txid>6304<checksum>",
  "requestId": "36jvlEhUYeknQ8PHKprR",
  "status": "0"
}
```

--------------------------------

### POST /refund

Source: https://www.ifthenpay.com/docs/en/api/refund

Initiates a refund for a payment. Supports partial refunds. Requires backoffice key, request ID, and the amount to be refunded.

```APIDOC
## POST /refund

### Description
Refund a Payment made via MB WAY, Credit Card, Google Pay or Apple Pay. Partial refunds can be made.

### Method
POST

### Endpoint
https://api.ifthenpay.com/v2/payments/refund

### Parameters
#### Request Body
- **backofficekey** (string) - Required - Key provided by ifthenpay when signing the contract.
- **requestId** (string) - Required - Token associated with the payment request transaction.
- **amount** (string) - Required - Amount to refund. Decimal separator is ".".

### Request Example
```json
{
  "backofficekey": "0000-0000-0000-0000",
  "requestId": "36jvlEhUYeknQ8PHKprR",
  "amount": "11.55"
}
```

### Response
#### Success Response (200)
- **Code** (string) - Indicates the status of the operation. '0' typically means success or a specific message.
- **Message** (string) - A message describing the outcome of the refund operation.

#### Response Example
```json
{
  "Code": "0",
  "Message": "Payment could not be refunded"
}
```
```

--------------------------------

### Request New Payment Reference (API)

Source: https://www.ifthenpay.com/docs/en/api/payshop

Sends a POST request to the Ifthenpay API to create a new payment reference. This endpoint requires a JSON body containing 'payshopkey', 'id', 'valor', and an optional 'validade'. The response indicates success or failure.

```shell
curl -X POST https://ifthenpay.com/api/payshop/reference \
-H "Content-Type: application/json" \
-d '{
  "payshopkey": "XXX-000000",
  "id": "12345",
  "valor": "5.00",
  "validade": 20301231
}'
```

--------------------------------

### POST /api/payshop/sandbox

Source: https://www.ifthenpay.com/docs/en/api/payshop

Request a new PAYSHOP payment reference in sandbox mode. This endpoint allows clients to generate a payment reference for testing purposes before going live.

```APIDOC
## POST /api/payshop/sandbox

### Description
Request a new PAYSHOP payment reference in sandbox mode. This endpoint allows clients to generate a payment reference for testing purposes before going live.

### Method
POST

### Endpoint
https://ifthenpay.com/api/payshop/sandbox

### Parameters
#### Request Body
- **id** (string) - Required - Payment identifier defined by the client (e.g., invoice number, order number, etc.). Maximum length of 15 characters.
- **payshopkey** (string) - Required - Assigned by ifthenpay.
- **valor** (string) - Required - Amount to be paid. Decimal separator ".".
- **validade** (string) - Optional - If you require an expiration date for the payshop reference, it should be provided in the format YYYYMMDD. Can be left blank.

### Request Example
```json
{
  "payshopkey": "XXX-000000",
  "id": "12345",
  "valor": "5.00",
  "validade": "20301231"
}
```

### Response
#### Success Response (200)
- **Code** (string) - Indicates the status of the operation.
- **Message** (string) - A message describing the result of the operation.
- **Reference** (string) - The generated payment reference number.
- **RequestId** (string) - A unique identifier for the request.

#### Response Example
```json
{
  "Code": "0",
  "Message": "Success",
  "Reference": "1021600051424",
  "RequestId": "3VcgFZrviWnSlTCJPLdz"
}
```
```

--------------------------------

### Refund a Payment using Shell (cURL)

Source: https://www.ifthenpay.com/docs/en/api/refund

This snippet demonstrates how to initiate a refund for a payment using the cURL command-line tool. It requires the backofficekey, requestId, and the amount to be refunded. The request is sent as a POST request with a JSON payload to the specified API endpoint.

```shell
curl https://api.ifthenpay.com/v2/payments/refund \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{ \
  "backofficekey": "0000-0000-0000-0000", \
  "requestId": "36jvlEhUYeknQ8PHKprR", \
  "amount": "11.55" \
}'
```

--------------------------------

### POST /pinpay/{GATEWAY_KEY}

Source: https://www.ifthenpay.com/docs/en/api/pbl

Requests a new payment link and PINPAY code for a given gateway key.

```APIDOC
## POST /pinpay/{GATEWAY_KEY}

### Description
Requests a new payment link and PINPAY code. This endpoint allows clients to generate a payment link or PINPAY code for a transaction, specifying various details such as amount, customer ID, and payment method preferences.

### Method
POST

### Endpoint
`/pinpay/{GATEWAY_KEY}`

### Parameters
#### Path Parameters
- **GATEWAY_KEY** (string) - Required - Your unique gateway key provided by IfthenPay.

#### Query Parameters
None

#### Request Body
- **amount** (string) - Required - The transaction amount, using '.' as the decimal separator (e.g., "21.50").
- **id** (string) - Required - A unique identifier for the payment defined by the client (e.g., invoice number, order number). Maximum length of 15 characters. If using Offline Multibanco Reference, only 4 numeric characters are allowed.
- **accounts** (string) - Available payment method accounts (e.g., "MBWAY|XXX-000000;11686|000;MB|BEM-700700;..."). Available methods: ENTITY|SUBENTITY, MB|MB-KEY, MBWAY|MBWAY-KEY, PAYSHOP|PAYSHOP-KEY, CCARD|CCARD-KEY, COFIDIS|COFIDIS-KEY, GOOGLE|GOOGLE-KEY, APPLE|APPLE-KEY.
- **btnCloseLabel** (string) - Optional - Label for the close/back button on the payment page (e.g., "Close").
- **btnCloseUrl** (string) - Optional - URL for the close/back button (e.g., "https://youraddress.com").
- **cancel_url** (string) - Optional - URL to redirect the customer if the transaction is canceled on the payment data entry page (e.g., "https://youraddress.com/cancel.php").
- **description** (string) - Optional - A description for the transaction, maximum length of 200 characters (e.g., "Order 1234").
- **error_url** (string) - Optional - URL to redirect the customer in case of an error preventing transaction completion (e.g., "https://youraddress.com/error.php").
- **expiredate** (string) - Optional - The expiration date in YYYYMMDD format (e.g., "20301231"). If left blank, default expiration rules apply. If the date exceeds 31 days, standard intervals (45, 60, 90, 120, 180, 365, or 730 days) will be applied.
- **lang** (string) - Optional - The language presented to the customer in the gateway (default is 'pt'). Available: 'pt', 'en', 'es', 'fr'.
- **otp** (string) - Optional - Enables the One-Time Payment option. Accepts 'true' or 'false' (default is 'false').
- **selected_method** (string) - Optional - Code of the selected payment method to be shown to the customer upon entering the payment gateway. Available codes: '1' (MULTIBANCO), '2' (MB WAY), '3' (PAYSHOP), '4' (CREDIT CARD), '7' (COFIDIS PAY), '8' (PIX).

### Request Example
```json
{
  "id": "1234",
  "amount": "21.50",
  "description": "Order 1234",
  "accounts": "MBWAY|XXX-000000;11686|000;MB|BEM-700700;...",
  "expiredate": "20301231",
  "success_url": "https://youraddress.com/sucess.php",
  "error_url": "https://youraddress.com/error.php",
  "cancel_url": "https://youraddress.com/cancel.php",
  "btnCloseUrl": "https://youraddress.com",
  "btnCloseLabel": "Close",
  "otp": "true",
  "lang": "pt",
  "selected_method": "1"
}
```

### Response
#### Success Response (200)
- **PinCode** (integer) - The generated PINPAY code.
- **RedirectUrl** (string) - The URL to redirect the customer for payment.
- **PinpayUrl** (string) - The direct URL to the PINPAY payment page.

#### Response Example
```json
{
  "PinCode": 1234567890,
  "RedirectUrl": "https://gateway.ifthenpay.com/url/r54aiUE1dX",
  "PinpayUrl": "https://pinpay.pt/1234567890"
}
```
```

--------------------------------

### Request New Payshop Payment Reference (Sandbox)

Source: https://www.ifthenpay.com/docs/en/api/payshop

Requests a new PAYSHOP payment reference in sandbox mode. Requires a payshopkey, id, and valor. An optional validade can be provided in YYYYMMDD format. The response includes a success code, message, reference number, and request ID.

```shell
curl https://ifthenpay.com/api/payshop/sandbox \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "payshopkey": "XXX-000000",
  "id": "12345",
  "valor": "5.00",
  "validade": 20301231
}'
```

--------------------------------

### Request New Payment Link and PINPAY Code (cURL)

Source: https://www.ifthenpay.com/docs/en/api/pbl

This snippet demonstrates how to initiate a request for a new payment link and PINPAY code using cURL. It includes the necessary POST request, headers, and a JSON payload with all required and optional parameters.

```shell
curl 'https://api.ifthenpay.com/gateway/pinpay/{GATEWAY_KEY}' \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "id": "1234",
  "amount": "21.50",
  "description": "Order 1234",
  "accounts": "MBWAY|XXX-000000;11686|000;MB|BEM-700700;...",
  "expiredate": 20301231,
  "success_url": "https://youraddress.com/sucess.php",
  "error_url": "https://youraddress.com/error.php",
  "cancel_url": "https://youraddress.com/cancel.php",
  "btnCloseUrl": "https://youraddress.com",
  "btnCloseLabel": "Close",
  "otp": "true",
  "lang": "pt",
  "selected_method": "1"
}'
```

--------------------------------

### Simple Checkout Link Generation

Source: https://www.ifthenpay.com/docs/en/guides/simple-checkout

This endpoint allows you to generate a Simple Checkout Link to process payments. It requires several parameters to define the transaction details.

```APIDOC
## GET /?token=[TOKEN]&id=[ID]&amount=[AMOUNT]&description=[DESCRIPTION]&expire=[EXPIRE]&lang=[LANG]

### Description
Generates a Simple Checkout Link for processing payments. This link directs customers to a secure payment page hosted by Ifthenpay.

### Method
GET

### Endpoint
https://gateway.ifthenpay.com/

### Parameters
#### Query Parameters
- **token** (string) - Required - Access key for the payment gateway. If the Gateway Key is Dynamic, filling the accounts field is mandatory. Parameter: GATEWAY KEY
- **id** (string) - Required - Unique identifier for the order. Parameter: ORDER ID
- **amount** (string) - Required - Payment amount in the format XX.XX. Parameter: AMOUNT
- **description** (string) - Optional - HTML-friendly description of the order. Parameter: DESCRIPTION
- **lang** (string) - Optional - Language for the interface. Accepted values: PT (Portuguese), EN (English), ES. Parameter: LANGUAGE
- **expire** (string) - Optional - Payment expiration date in YYYYMMDD format. Parameter: EXPIRATION DATE
- **btn_close_url** (string) - Optional - URL for the "Close" button.
- **btn_close_label** (string) - Optional - Text label for the "Close" button.
- **accounts** (string) - Optional - Specifies accounts to be used in the format `ENTITY|SUBENTITY;MBWAY|MBWAY-KEY;PAYSHOP|PAYSHOP-KEY;CCARD|CCARD-KEY;MB|MB-KEY...`
  Available methods: 
    * ENTITY|SUBENTITY - Multibanco offline
    * MB|MB-KEY - Multibanco
    * MBWAY|MBWAY-KEY - MB WAY
    * PAYSHOP|PAYSHOP-KEY - Payshop
    * CCARD|CCARD-KEY - Credit Card
    * COFIDIS|COFIDIS-KEY - COFIDIS Pay
    * GOOGLE|GOOGLE-KEY - Google Pay
    * APPLE|APPLE-KEY - Apple Pay
    * PIX|PIX-KEY - PIX
- **success_url** (string) - Optional - Redirect URL upon successful payment.
- **cancel_url** (string) - Optional - Redirect URL for canceled payments.
- **return_url** (string) - Optional - URL for returning to the website after completing the payment process.
- **error_url** (string) - Optional - URL to redirect in case of a payment error.
- **selected_method** (string) - Optional - Specifies the payment method tab to open by default - 1: Multibanco - 2: MBWAY - 3: Payshop - 4: Credit Card - 7: Cofidis Pay - 8: PIX. Example usage: selected_method=2
- **iframe** (string) - Optional - Use this parameter if you need to display the link within an iframe. - true: enables iframe usage - false: disables iframe usage. Example usage: iframe=true

### Request Example
```
https://gateway.ifthenpay.com/?token=NXXX-999999&id=10501&amount=10.50&description=Order No. 2010501&expire=20291029&lang=PT
```

### Response
#### Success Response (200)
- **URL** (string) - The generated Simple Checkout Link.

#### Response Example
```
{
  "URL": "https://gateway.ifthenpay.com/?token=NXXX-999999&id=10501&amount=10.50&description=Order No. 2010501&expire=20291029&lang=PT"
}
```
```

--------------------------------

### POST /multibanco/reference/sandbox - Request New Payment Reference in Sandbox Mode

Source: https://www.ifthenpay.com/docs/en/api/multibanco

Requests a new MULTIBANCO payment reference for testing purposes in a sandbox environment. This helps in verifying integration without affecting production data.

```APIDOC
## POST /multibanco/reference/sandbox

### Description
Requests a new MULTIBANCO payment reference for testing purposes in a sandbox environment. This helps in verifying integration without affecting production data.

### Method
POST

### Endpoint
https://api.ifthenpay.com/multibanco/reference/sandbox

### Parameters
#### Request Body
- **amount** (string) - Required - The payment amount, must contain exactly two decimal places using "." as the decimal separator.
- **mbKey** (string) - Required - The 'MB KEY' assigned by ifthenpay.
- **orderId** (string) - Required - Order/invoice number, with a maximum length of 25 characters.
- **clientCode** (string) - Optional - Client's code, with a maximum length of 200 characters.
- **clientEmail** (string) - Optional - Client's email address, with a maximum length of 200 characters.
- **clientName** (string) - Optional - Client's name, with a maximum length of 200 characters.
- **clientPhone** (string) - Optional - Client's cell phone or phone number, with a maximum length of 200 characters.
- **clientUsername** (string) - Optional - Client's username, with a maximum length of 200 characters.
- **description** (string) - Optional - A description for the payment, with a maximum length of 200 characters.
- **expiryDays** (number) - Optional - The number of days until the reference expires. If omitted, the reference will not expire. Valid values range from 0 to 31. If a value outside this range is provided, the closest available duration will be assigned.
- **url** (string) - Optional - The URL address for the transaction, with a maximum length of 100 characters.

### Request Example
```json
{
  "mbKey": "ZZZ-000000",
  "orderId": "1887",
  "amount": "10.99",
  "description": "order 1 payment",
  "url": "https://www.empresa.com",
  "clientCode": "123",
  "clientName": "John Doe",
  "clientEmail": "empresa@empresa.com",
  "clientUsername": "johndoe",
  "clientPhone": "351976543210",
  "expiryDays": 0
}
```

### Response
#### Success Response (200)
- **Amount** (number) - The payment amount.
- **Entity** (number) - The MULTIBANCO entity code.
- **ExpiryDate** (string) - The expiration date of the reference.
- **Message** (string) - A success message.
- **OrderId** (number) - The order ID associated with the payment.
- **Reference** (string) - The generated MULTIBANCO reference number.
- **RequestId** (string) - A unique identifier for the request.
- **Status** (string) - The status of the operation (e.g., "0" for success).

#### Response Example
```json
{
  "Amount": 10.99,
  "Entity": 11990,
  "ExpiryDate": "30-10-2021",
  "Message": "Success",
  "OrderId": 1887,
  "Reference": "000000291",
  "RequestId": "5Qd8gtWLAEUJ6n0lkS5g",
  "Status": "0"
}
```
```

--------------------------------

### POST /multibanco/reference/init - Request New Payment Reference

Source: https://www.ifthenpay.com/docs/en/api/multibanco

Requests a new MULTIBANCO payment reference for a transaction. This endpoint is used for production environments.

```APIDOC
## POST /multibanco/reference/init

### Description
Requests a new MULTIBANCO payment reference for a transaction. This endpoint is used for production environments.

### Method
POST

### Endpoint
https://api.ifthenpay.com/multibanco/reference/init

### Parameters
#### Request Body
- **amount** (string) - Required - The payment amount, must contain exactly two decimal places using "." as the decimal separator.
- **mbKey** (string) - Required - The 'MB KEY' assigned by ifthenpay.
- **orderId** (string) - Required - Order/invoice number, with a maximum length of 25 characters.
- **clientCode** (string) - Optional - Client's code, with a maximum length of 200 characters.
- **clientEmail** (string) - Optional - Client's email address, with a maximum length of 200 characters.
- **clientName** (string) - Optional - Client's name, with a maximum length of 200 characters.
- **clientPhone** (string) - Optional - Client's cell phone or phone number, with a maximum length of 200 characters.
- **clientUsername** (string) - Optional - Client's username, with a maximum length of 200 characters.
- **description** (string) - Optional - A description for the payment, with a maximum length of 200 characters.
- **expiryDays** (number) - Optional - The number of days until the reference expires. If omitted, the reference will not expire. Valid values range from 0 to 31. If a value outside this range is provided, the closest available duration will be assigned.
- **url** (string) - Optional - The URL address for the transaction, with a maximum length of 100 characters.

### Request Example
```json
{
  "mbKey": "ZZZ-000000",
  "orderId": "1887",
  "amount": "10.99",
  "description": "order 1 payment",
  "url": "https://www.empresa.com",
  "clientCode": "123",
  "clientName": "John Doe",
  "clientEmail": "empresa@empresa.com",
  "clientUsername": "johndoe",
  "clientPhone": "351976543210",
  "expiryDays": 0
}
```

### Response
#### Success Response (200)
- **Amount** (number) - The payment amount.
- **Entity** (number) - The MULTIBANCO entity code.
- **ExpiryDate** (string) - The expiration date of the reference.
- **Message** (string) - A success message.
- **OrderId** (number) - The order ID associated with the payment.
- **Reference** (string) - The generated MULTIBANCO reference number.
- **RequestId** (string) - A unique identifier for the request.
- **Status** (string) - The status of the operation (e.g., "0" for success).

#### Response Example
```json
{
  "Amount": 10.99,
  "Entity": 11990,
  "ExpiryDate": "30-10-2021",
  "Message": "Success",
  "OrderId": 1887,
  "Reference": "000000291",
  "RequestId": "5Qd8gtWLAEUJ6n0lkS5g",
  "Status": "0"
}
```
```

--------------------------------

### POST /pinpay/{GATEWAY_KEY}

Source: https://www.ifthenpay.com/docs/en/api/pbl

Requests a new payment link and a PIN PAY code. This endpoint is used to initiate a transaction and obtain the necessary details for the customer to complete the payment.

```APIDOC
## POST /pinpay/{GATEWAY_KEY}

### Description
Requests a new payment link and a PIN PAY code. This endpoint is used to initiate a transaction and obtain the necessary details for the customer to complete the payment.

### Method
POST

### Endpoint
/pinpay/{GATEWAY_KEY}

### Parameters
#### Path Parameters
- **GATEWAY_KEY** (string) - Required - The unique GATEWAY KEY provided by ifthenpay.

### Request Example
```json
{
  "transactionId": "YOUR_TRANSACTION_ID",
  "amount": 100.50,
  "currency": "EUR",
  "description": "Payment for order #12345"
}
```

### Response
#### Success Response (200)
- **status** (string) - Indicates the success or failure of the request.
- **message** (string) - A message providing details about the response.
- **paymentLink** (string) - The generated payment link for the customer.
- **pinPayCode** (string) - The generated PIN PAY code.

#### Response Example
```json
{
  "status": "success",
  "message": "Payment link and PIN generated successfully.",
  "paymentLink": "https://pay.ifthenpay.com/link/abcdef123456",
  "pinPayCode": "PIN123456789"
}
```
```

--------------------------------

### Request New Payment Link and PINPAY Code (Shell Curl)

Source: https://www.ifthenpay.com/docs/en/api/pbl

This cURL command shows how to request a new payment link and PINPAY code by sending a POST request to the Ifthenpay API. It requires the GATEWAY_KEY as a path parameter and a detailed JSON body specifying transaction details like amount, description, account types, expiry date, and redirect URLs.

```shell
curl https://api.ifthenpay.com/gateway/pinpay/{GATEWAY_KEY} \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{ "id": "1234", "amount": "21.50", "description": "Order 1234", "accounts": "MBWAY|XXX-000000;11686|000;MB|BEM-700700;...", "expiredate": 20301231, "success_url": "https://youraddress.com/sucess.php", "error_url": "https://youraddress.com/error.php", "cancel_url": "https://youraddress.com/cancel.php", "btnCloseUrl": "https://youraddress.com", "btnCloseLabel": "Close", "otp": "true", "lang": "pt", "selected_method": "1"}'
```

--------------------------------

### Create Payment Order

Source: https://www.ifthenpay.com/docs/en/api/pix

This endpoint allows you to create a new payment order with detailed customer and order information.

```APIDOC
## POST /websites/ifthenpay_en

### Description
Creates a new payment order with specified details including order ID, amount, customer information, and redirect URL.

### Method
POST

### Endpoint
/websites/ifthenpay_en

### Parameters
#### Request Body
- **orderId** (string) - Required - The unique identifier for the order.
- **amount** (string) - Required - The total amount of the order.
- **redirectUrl** (string) - Required - The URL to redirect the customer to after payment.
- **description** (string) - Optional - A description of the order.
- **customerName** (string) - Optional - The full name of the customer.
- **customerCpf** (string) - Optional - The customer's CPF (Cadastro de Pessoas Físicas).
- **customerEmail** (string) - Optional - The customer's email address.
- **customerPhone** (string) - Optional - The customer's phone number.
- **customerAddress** (string) - Optional - The customer's street address.
- **customerStreetNumber** (string) - Optional - The street number of the customer's address.
- **customerZipCode** (string) - Optional - The customer's zip code.
- **customerCity** (string) - Optional - The customer's city.
- **customerState** (string) - Optional - The customer's state.

### Request Example
```json
{
  "orderId": "order_45678",
  "amount": "11.55",
  "redirectUrl": "https://youraddress.com/status.php",
  "description": "Order 45678",
  "customerName": "John Doe",
  "customerCpf": "74026594025",
  "customerEmail": "johndoe@example.com",
  "customerPhone": "+351256245560",
  "customerAddress": "Main Street",
  "customerStreetNumber": "123",
  "customerZipCode": "12345",
  "customerCity": "New York",
  "customerState": "New York"
}
```

### Response
#### Success Response (200)
- **status** (string) - The status of the payment order.
- **paymentUrl** (string) - The URL where the customer can complete the payment.

#### Response Example
```json
{
  "status": "success",
  "paymentUrl": "https://pay.ifthenpay.com/"
}
```
```

--------------------------------

### Request New Payment Reference (Production Mode)

Source: https://www.ifthenpay.com/docs/en/api/multibanco

This section outlines the request body for initiating a new MULTIBANCO payment reference in production. It includes essential fields like mbKey, orderId, amount, and client information, along with optional fields for description, URL, and expiry days.

```json
{ "mbKey": "ZZZ-000000", "orderId": "1887", "amount": "10.99", "description": "order 1 payment", "url": "https://www.empresa.com", "clientCode": 123, "clientName": "John Doe", "clientEmail": "empresa@empresa.com", "clientUsername": "johndoe", "clientPhone": 351976543210, "expiryDays": "0"}
```

--------------------------------

### Request New Payment Reference (POST)

Source: https://www.ifthenpay.com/docs/en/api/payshop

Requests a new PAYSHOP payment reference using a POST request. Requires 'payshopkey', 'id', and 'valor'. 'validade' is optional. The response includes a 'Code', 'Message', 'Reference', and 'RequestId'.

```curl
curl https://ifthenpay.com/api/payshop/reference \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "payshopkey": "XXX-000000",
  "id": "12345",
  "valor": "5.00",
  "validade": 20301231
}'
```

--------------------------------

### Initiate COFIDIS PAY Payment

Source: https://www.ifthenpay.com/docs/en/api/cofidispay

Requests a new COFIDIS PAY payment. Requires the merchant's unique COFIDIS KEY.

```APIDOC
## POST /init/{COFIDIS_KEY}

### Description
Requests a new payment initiation using the COFIDIS PAY service. The `{COFIDIS_KEY}` must be replaced with the key provided by Ifthenpay.

### Method
POST

### Endpoint
/init/{COFIDIS_KEY}

### Parameters
#### Path Parameters
- **COFIDIS_KEY** (string) - Required - The unique key provided by Ifthenpay for your merchant account.

#### Request Body
- **OrderID** (string) - Required - Unique identifier for the order. Must be unique for each initialization request in sandbox mode.
- **Amount** (number) - Required - The total amount of the payment.
- **CustomerVat** (string) - Required - The customer's VAT number. Must be unique for each initialization request in sandbox mode.
- **CustomerEmail** (string) - Required - The customer's email address. Must be unique for each initialization request in sandbox mode.
- **CustomerPhone** (string) - Required - The customer's phone number. Must be unique for each initialization request in sandbox mode.
- **PaymentDescription** (string) - Optional - A description for the payment.
- **CustomerName** (string) - Optional - The customer's full name.
- **CustomerAddress** (string) - Optional - The customer's address.
- **CustomerCity** (string) - Optional - The customer's city.
- **CustomerPostalCode** (string) - Optional - The customer's postal code.

### Request Example
```json
{
  "OrderID": "12345",
  "Amount": 100.50,
  "CustomerVat": "123456789",
  "CustomerEmail": "customer@example.com",
  "CustomerPhone": "+351123456789",
  "PaymentDescription": "Order #12345 Payment",
  "CustomerName": "John Doe",
  "CustomerAddress": "123 Main St",
  "CustomerCity": "Lisbon",
  "CustomerPostalCode": "1000-001"
}
```

### Response
#### Success Response (200)
- **status** (string) - Indicates the status of the payment initiation.
- **message** (string) - A message related to the payment initiation.
- **paymentUrl** (string) - The URL where the customer can complete the payment.

#### Response Example
```json
{
  "status": "success",
  "message": "Payment initiated successfully.",
  "paymentUrl": "https://sandbox.cofidispay.com/pay?token=..."
}
```
```

--------------------------------

### Enable or Disable Payment Link and PINPAY Code (Shell Curl)

Source: https://www.ifthenpay.com/docs/en/api/pbl

This cURL command demonstrates how to enable or disable a payment link and its associated PINPAY code by sending a POST request to the Ifthenpay API. It requires the GATEWAY_KEY and the desired REQUEST_STATUS (enable/disable) as path parameters, and a JSON body containing the redirect URL.

```shell
curl 'https://api.ifthenpay.com/gateway/{GATEWAY_KEY}/{REQUEST_STATUS}' \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "url": "https://gateway.ifthenpay.com/url/08c6nh97sn or https://pinpay.pt/08c6nh97sn"
}'
```

--------------------------------

### Request New Payment Reference (Sandbox Mode)

Source: https://www.ifthenpay.com/docs/en/api/multibanco

This snippet demonstrates how to request a new MULTIBANCO payment reference in sandbox mode. It requires parameters such as amount, order ID, and client details. The response includes the generated reference number and other transaction details.

```shell
curl https://api.ifthenpay.com/multibanco/reference/sandbox \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "mbKey": "ZZZ-000000",
  "orderId": "1887",
  "amount": "10.99",
  "description": "order 1 payment",
  "url": "https://www.empresa.com",
  "clientCode": 123,
  "clientName": "John Doe",
  "clientEmail": "empresa@empresa.com",
  "clientUsername": "johndoe",
  "clientPhone": 351976543210,
  "expiryDays": "0"
}'
```

--------------------------------

### POST /reference - Request New Payment Reference

Source: https://www.ifthenpay.com/docs/en/api/payshop

Requests a new PAYSHOP payment reference. This is the production endpoint.

```APIDOC
## POST /reference

### Description
Request a new PAYSHOP payment reference.

### Method
POST

### Endpoint
https://ifthenpay.com/api/payshop/reference

### Parameters
#### Query Parameters
- **payshopkey** (string) - Required - Assigned by ifthenpay.
- **id** (string) - Required - Payment identifier defined by the client (e.g., invoice number, order number, etc.). Maximum length of 15 characters.
- **valor** (string) - Required - Amount to be paid. Decimal separator ".".
- **validade** (string) - Optional - If you require an expiration date for the payshop reference, it should be provided in the format YYYYMMDD. Can be left blank.

### Request Body
```json
{
  "payshopkey": "XXX-000000",
  "id": "12345",
  "valor": "5.00",
  "validade": "20301231"
}
```

### Response
#### Success Response (200)
- **Code** (string) - Operation status code.
- **Message** (string) - Operation status message.
- **Reference** (string) - The generated PAYSHOP reference.
- **RequestId** (string) - Unique identifier for the request.

#### Response Example
```json
{
  "Code": "0",
  "Message": "Success",
  "Reference": "1021600051424",
  "RequestId": "3VcgFZrviWnSlTCJPLdz"
}
```
```

--------------------------------

### POST /api/payshop/reference

Source: https://www.ifthenpay.com/docs/en/api/payshop

Request a new PAYSHOP payment reference. This is the live endpoint for generating payment references for actual transactions.

```APIDOC
## POST /api/payshop/reference

### Description
Request a new PAYSHOP payment reference. This is the live endpoint for generating payment references for actual transactions.

### Method
POST

### Endpoint
https://ifthenpay.com/api/payshop/reference

### Parameters
#### Request Body
- **id** (string) - Required - Payment identifier defined by the client (e.g., invoice number, order number, etc.). Maximum length of 15 characters.
- **payshopkey** (string) - Required - Assigned by ifthenpay.
- **valor** (string) - Required - Amount to be paid. Decimal separator ".".
- **validade** (string) - Optional - If you require an expiration date for the payshop reference, it should be provided in the format YYYYMMDD. Can be left blank.

### Request Example
```json
{
  "payshopkey": "XXX-000000",
  "id": "12345",
  "valor": "5.00",
  "validade": "20301231"
}
```

### Response
#### Success Response (200)
*Note: The success response schema for this endpoint is not explicitly detailed in the provided text, but it is expected to be similar to the sandbox success response.* 
- **Code** (string) - Indicates the status of the operation.
- **Message** (string) - A message describing the result of the operation.
- **Reference** (string) - The generated payment reference number.
- **RequestId** (string) - A unique identifier for the request.

#### Response Example
```json
{
  "Code": "0",
  "Message": "Success",
  "Reference": "1021600051424",
  "RequestId": "3VcgFZrviWnSlTCJPLdz"
}
```
```

--------------------------------

### PIX Webhooks

Source: https://www.ifthenpay.com/docs/en/guides/callback

Handles callback URLs for PIX payments, confirming successful transactions with relevant details.

```APIDOC
## PIX Webhooks

### Description
This section describes the callback URL for PIX payments, which is triggered after a successful transaction.

### Callback URL
**Endpoint:** `https://www.yoursite.com/callback.php`

**Method:** GET

**Query Parameters:**
- **anti_phishing_key** (string) - Required - The anti-phishing key that validates the authenticity of the transaction.
- **order_id** (string) - Required - The unique order ID associated with the transaction.
- **amount** (number) - Required - The total amount of the transaction.
- **payment_datetime** (string) - Required - The date and time when the payment was made (format: DD-MM-YYYY HH:MM:SS).

**Example:**
`https://www.yoursite.com/callback.php?anti_phishing_key=my_anti_phishing_key&order_id=12345&amount=5.00&payment_datetime=28-10-2021 10:55:21`
```

--------------------------------

### Retrieve Cofidis PAY Payment Limits

Source: https://www.ifthenpay.com/docs/en/api/cofidispay

Retrieves the payment limits (minimum and maximum amount) for a Cofidis PAY client. Requires the COFIDIS_KEY in the URL path. Returns an object containing the limits.

```shell
curl 'https://api.ifthenpay.com/cofidis/limits/{COFIDIS_KEY}'
```

--------------------------------

### PAY BY LINK & PINPAY Webhooks

Source: https://www.ifthenpay.com/docs/en/guides/callback

Handles callback URLs for Pay by Link and PinPay payments, providing transaction confirmation details.

```APIDOC
## PAY BY LINK & PINPAY Webhooks

### Description
This section describes the callback URL for Pay by Link and PinPay payments, which is triggered after a successful transaction.

### Callback URL
**Endpoint:** `https://www.yoursite.com/callback.php`

**Method:** GET

**Query Parameters:**
- **key** (string) - Required - The anti-phishing key that validates the authenticity of the transaction.
- **id** (string) - Required - The order ID associated with the transaction.
- **amount** (number) - Required - The total amount of the transaction.
- **payment_datetime** (string) - Required - The date and time when the payment was made (format: DD-MM-YYYY HH:MM:SS).
- **payment_method** (string) - Required - The payment method used for the transaction (e.g., CCARD).

**Example:**
`https://www.yoursite.com/callback.php?key=my_anti_phishing_key&id=1234&amount=21.50&payment_datetime=28-10-2021 10:55:21&payment_method=CCARD`
```

--------------------------------

### Request New Payment Link and PINPAY Code

Source: https://www.ifthenpay.com/docs/en/api/pbl

Initiates a new payment request, generating a payment link and PINPAY code with specified transaction details.

```APIDOC
## POST /gateway/pinpay/{GATEWAY_KEY}

### Description
Requests a new payment link and PINPAY code for a transaction.

### Method
POST

### Endpoint
`/gateway/pinpay/{GATEWAY_KEY}`

### Parameters
#### Path Parameters
- **GATEWAY_KEY** (string) - Required - The gateway key for the transaction.

#### Query Parameters
None

#### Request Body
- **id** (string) - Required - A unique identifier for the transaction.
- **amount** (string) - Required - The transaction amount.
- **description** (string) - Required - A description for the transaction.
- **accounts** (string) - Required - Payment accounts available (e.g., "MBWAY|XXX-000000;11686|000;MB|BEM-700700;...").
- **expiredate** (integer) - Required - Expiration date in YYYYMMDD format.
- **success_url** (string) - Required - URL to redirect to upon successful payment.
- **error_url** (string) - Required - URL to redirect to upon payment error.
- **cancel_url** (string) - Required - URL to redirect to upon payment cancellation.
- **btnCloseUrl** (string) - Optional - URL for a close button.
- **btnCloseLabel** (string) - Optional - Label for the close button.
- **otp** (string) - Optional - Whether to enable OTP (e.g., "true").
- **lang** (string) - Optional - Language code for the payment interface (e.g., "pt").
- **selected_method** (string) - Optional - The initially selected payment method.

### Request Example
```json
{
  "id": "1234",
  "amount": "21.50",
  "description": "Order 1234",
  "accounts": "MBWAY|XXX-000000;11686|000;MB|BEM-700700;...",
  "expiredate": 20301231,
  "success_url": "https://youraddress.com/sucess.php",
  "error_url": "https://youraddress.com/error.php",
  "cancel_url": "https://youraddress.com/cancel.php",
  "btnCloseUrl": "https://youraddress.com",
  "btnCloseLabel": "Close",
  "otp": "true",
  "lang": "pt",
  "selected_method": "1"
}
```

### Response
#### Success Response (200)
(Schema not fully detailed in the provided text, but typically includes payment link details)

#### Response Example
(Example response structure not provided in the input text)
```

--------------------------------

### Check PIX Payment Status Request (Shell Curl)

Source: https://www.ifthenpay.com/docs/en/api/pix

This snippet shows how to check the status of a PIX payment using a cURL command. It requires a 'requestId' obtained from the payment initiation response as a query parameter. The response indicates the success or failure of the payment status check.

```shell
curl 'https://api.ifthenpay.com/pix/payment/status/?requestId=i2szvoUfPYBMWdSxqO3n'
```

--------------------------------

### Multibanco Callback Notification URL Structure

Source: https://www.ifthenpay.com/docs/en/guides/callback

This section details the specific parameters included in the callback URL when the payment method is Multibanco.

```APIDOC
## GET /callback_multibanco

### Description
This endpoint represents the callback URL for Multibanco payments. It includes additional parameters specific to Multibanco transactions, sent via a GET request to your configured URL.

### Method
GET

### Endpoint
`https://www.yoursite.com/callback.php` (or your configured callback URL)

### Query Parameters
- **key** (string) - Required - The anti-phishing key to validate the authenticity of the transaction.
- **orderId** (string) - Required - The unique order ID associated with the transaction.
- **amount** (number) - Required - The total amount of the transaction.
- **requestId** (string) - Required - The request ID that initiated the payment.
- **entity** (string) - Required - The Multibanco entity that was used to process the payment.
- **reference** (string) - Required - The Multibanco reference that was used to process the payment.
- **payment_datetime** (string) - Required - The date and time when the payment was made.

### Request Example
```
https://www.yoursite.com/callback.php?key=my_anti_phishing_key&orderId=order-1234&amount=1234.56&requestId=5Qd8gtWLAEUJ6n0lkS5g&entity=99999&reference=123456789&payment_datetime=28-10-2021 10:55:21
```

### Response
#### Success Response (200)
Your server should respond with a 200 OK status to acknowledge receipt of the Multibanco callback.

#### Response Example
```json
{
  "status": "success",
  "message": "Multibanco callback received and processed."
}
```
```

--------------------------------

### Retrieve List of Payments using cURL

Source: https://www.ifthenpay.com/docs/en/api/list-of-payments-rest

This snippet demonstrates how to retrieve a list of payments using a cURL command. It requires the backoffice key and optionally accepts parameters like entity, subEntity, reference, orderId, amount, requestId, dateStart, and dateEnd. If no parameters are provided, it returns the 1,000 most recent payments.

```shell
curl https://api.ifthenpay.com/v2/payments/read \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "boKey": "0000-0000-0000-0000",
  "entity": null,
  "subEntity": null,
  "reference": null,
  "orderId": null,
  "amount": null,
  "requestId": null,
  "dateStart": "21-10-2024 00:00:00",
  "dateEnd": "21-10-2024 00:00:00"
}'
```

--------------------------------

### Callback Notification URL Structure

Source: https://www.ifthenpay.com/docs/en/guides/callback

This section outlines the general structure of the callback URL and the purpose of each parameter that ifthenpay sends to your specified endpoint.

```APIDOC
## GET /callback

### Description
This endpoint is not directly called by the user. Instead, it represents the URL on your server that ifthenpay will send payment confirmation details to via a GET request when a payment is successfully processed.

### Method
GET

### Endpoint
`http://www.yoursite.com/callback.php` (or your configured callback URL)

### Query Parameters
- **key** (string) - Required - The anti-phishing key to validate the authenticity of the transaction.
- **orderId** (string) - Required - The unique order ID associated with the transaction.
- **amount** (number) - Required - The total amount of the transaction.
- **requestId** (string) - Required - The request ID that initiated the payment.
- **payment_datetime** (string) - Required - The date and time when the payment was made (format may vary).

### Request Example
```
http://www.yoursite.com/callback.php?key=YOUR_ANTI_PHISHING_KEY&orderId=ORDER123&amount=50.00&requestId=REQ456&payment_datetime=2023-10-27T10:30:00Z
```

### Response
#### Success Response (200)
While the callback is a server-to-server communication, your server should ideally respond with a 200 OK status to acknowledge receipt of the callback. The content of the response is up to your server's implementation.

#### Response Example
```json
{
  "status": "success",
  "message": "Callback received and processed."
}
```
```

--------------------------------

### Send Request using cURL

Source: https://www.ifthenpay.com/docs/en/api/cofidispay

This snippet demonstrates how to send a POST request to the Ifthenpay API using cURL. It includes setting the Content-Type header and the JSON request body.

```Shell
curl -X POST \
  http://localhost:3000/ \
  -H 'Content-Type: application/json' \
  -d '{ \
    "orderId": "order_45678", \
    "amount": "11.55", \
    "returnUrl": "https://youraddress.com/status.php", \
    "description": "Order 45678", \
    "customerName": "John Doe", \
    "customerVat": "123456789", \
    "customerEmail": "johndoe@example.com", \
    "customerPhone": "+351256245560", \
    "billingAddress": "123 Main Street", \
    "billingZipCode": "12345", \
    "billingCity": "New York", \
    "deliveryAddress": "456 Elm Street", \
    "deliveryZipCode": "67890", \
    "deliveryCity": "Los Angeles" \
}'
```

--------------------------------

### POST /multibanco/reference/sandbox

Source: https://www.ifthenpay.com/docs/en/api/multibanco

Requests a new MULTIBANCO payment reference in sandbox mode. This endpoint allows you to generate a payment reference with various details about the transaction and client.

```APIDOC
## POST /multibanco/reference/sandbox

### Description
Requests a new MULTIBANCO payment reference in sandbox mode. This endpoint allows you to generate a payment reference with various details about the transaction and client.

### Method
POST

### Endpoint
https://api.ifthenpay.com/multibanco/reference/sandbox

### Parameters
#### Request Body
- **amount** (string) - Required - The transaction amount, must contain exactly two decimal places using "." as the decimal separator. Example: "10.99"
- **mbKey** (string) - Required - The key assigned by IfthenPay. Example: "ZZZ-000000"
- **orderId** (string) - Required - Order or invoice number, with a maximum length of 25 characters. Example: "1887"
- **clientCode** (string) - Optional - Client's code, with a maximum length of 200 characters. Example: "123"
- **clientEmail** (string) - Optional - Client's email address, with a maximum length of 200 characters. Example: "empresa@empresa.com"
- **clientName** (string) - Optional - Client's name, with a maximum length of 200 characters. Example: "John Doe"
- **clientPhone** (string) - Optional - Client's cell phone or phone number, with a maximum length of 200 characters. Example: "351976543210"
- **clientUsername** (string) - Optional - Client's username, with a maximum length of 200 characters. Example: "johndoe"
- **description** (string) - Optional - A description for the payment, with a maximum length of 200 characters. Example: "order 1 payment"
- **expiryDays** (number) - Optional - The number of days until the reference expires. Use 0 for expiration at midnight on the same day. If omitted, the reference has no expiration date. Example: 0
- **url** (string) - Optional - The URL address for notifications, with a maximum length of 100 characters. Example: "https://www.empresa.com"

### Request Example
```json
{
  "mbKey": "ZZZ-000000",
  "orderId": "1887",
  "amount": "10.99",
  "description": "order 1 payment",
  "url": "https://www.empresa.com",
  "clientCode": "123",
  "clientName": "John Doe",
  "clientEmail": "empresa@empresa.com",
  "clientUsername": "johndoe",
  "clientPhone": "351976543210",
  "expiryDays": "0"
}
```

### Response
#### Success Response (200)
- **Amount** (number) - The transaction amount.
- **Entity** (number) - The MULTIBANCO entity code.
- **ExpiryDate** (string) - The expiration date of the reference in DD-MM-YYYY format.
- **Message** (string) - A success message.
- **OrderId** (number) - The order ID provided in the request.
- **Reference** (string) - The generated MULTIBANCO payment reference.
- **RequestId** (string) - A unique identifier for the request.
- **Status** (string) - The status code of the operation (e.g., "0" for success).

#### Response Example
```json
{
  "Amount": 10.99,
  "Entity": 11990,
  "ExpiryDate": "30-10-2021",
  "Message": "Success",
  "OrderId": 1887,
  "Reference": "000000291",
  "RequestId": "5Qd8gtWLAEUJ6n0lkS5g",
  "Status": "0"
}
```
```

--------------------------------

### Retrieve Payments List in XML Format (cURL)

Source: https://www.ifthenpay.com/docs/en/api/list-of-payments

Retrieves a list of all payments matching specified criteria in XML format using a cURL request. Requires authentication key, entity, subentity, date/time range, and optional payment details. The sandbox parameter controls test environment usage.

```shell
curl 'https://ifthenpay.com/ifmbws/ifmbws.asmx/getPaymentsXml?chavebackoffice=0000-0000-0000-0000&entidade=11604&subentidade=999&dtHrInicio=23-05-2012%2000%3A00%3A00&dtHrFim=23-05-2012%2023%3A59%3A59&referencia=%20&Valor=%20&sandbox=0'
```

--------------------------------

### POST /v2/payments/read

Source: https://www.ifthenpay.com/docs/en/api/list-of-payments-rest

Retrieves a list of all payments matching the specified criteria. Only the backoffice access key is required; all other parameters are optional. If no parameters are provided, the 1,000 most recent payments are returned.

```APIDOC
## POST /v2/payments/read

### Description
Retrieve a list of all payments matching the specified criteria. This endpoint allows you to fetch payment records using various optional filters.

### Method
POST

### Endpoint
https://api.ifthenpay.com/v2/payments/read

### Parameters
#### Request Body
- **boKey** (string) - Required - The backoffice access key provided by ifthenpay.
- **amount** (string) - Optional - The total payment amount. Can be left blank.
- **dateEnd** (string) - Optional - The end date/time of the desired payments in the format dd-MM-yyyy HH:mm. Can be left blank.
- **dateStart** (string) - Optional - The start date/time of the desired payments in the format dd-MM-yyyy HH:mm:ss. Can be left blank.
- **entity** (string) - Optional - The entity (e.g., 5 digits, MB, MBWAY, PAYSHOP, CCARD, COFIDIS, GOOGLE, APPLE, PIX, TPA). Can be left blank.
- **orderId** (string) - Optional - The unique identifier for the order. Can be left blank.
- **reference** (string) - Optional - The unique payment reference for Multibanco and Payshop; for other methods, it matches the orderId. Can be left blank.
- **requestId** (string) - Optional - The unique token associated with the request. Can be left blank.
- **subEntity** (string) - Optional - The subentity (e.g., 3 digits, MB KEY, MBWAY Key, PAYSHOP KEY, CCARD KEY, COFIDIS KEY, GOOGLE KEY, APPLE KEY, PIX KEY, TPA KEY). Can be left blank.

### Request Example
```json
{
  "boKey": "0000-0000-0000-0000",
  "entity": null,
  "subEntity": null,
  "reference": null,
  "orderId": null,
  "amount": null,
  "requestId": null,
  "dateStart": "21-10-2024 00:00:00",
  "dateEnd": "21-10-2024 00:00:00"
}
```

### Response
#### Success Response (200)
- **message** (string) - Indicates the status of the operation.
- **status** (integer) - The HTTP status code.
- **payments** (array) - An array of payment objects.
  - **amount** (integer) - The payment amount.
  - **entity** (string) - The payment entity.
  - **fee** (float) - The transaction fee.
  - **netAmount** (float) - The net amount after fee deduction.
  - **orderId** (string) - The unique order identifier.
  - **paymentDate** (string) - The date and time of the payment.
  - **procDate** (string) - The processing date.
  - **reference** (string) - The payment reference.
  - **requestId** (string) - The unique request identifier.
  - **subEntity** (string) - The subentity.
  - **terminal** (string) - The terminal information.

#### Response Example
```json
{
  "message": "OK",
  "status": 200,
  "payments": [
    {
      "amount": 22750,
      "entity": "MB",
      "fee": 0.86,
      "netAmount": 22749.14,
      "orderId": "000017273",
      "paymentDate": "21-10-2024 15:41:00",
      "procDate": "20241021",
      "reference": "007875810",
      "requestId": "wIh3HzFByfmj75Adl98x",
      "subEntity": "XXX-000000",
      "terminal": "5-0000000000-CAIXA GERAL DE "
    }
  ]
}
```
```

--------------------------------

### Retrieve Payments List in SOAP Format (cURL)

Source: https://www.ifthenpay.com/docs/en/api/list-of-payments

Retrieves a list of all payments matching specified criteria in XML format using a SOAP request. Requires authentication key, entity, subentity, date/time range, and optional payment details. The sandbox parameter controls test environment usage.

```shell
curl 'https://ifthenpay.com/ifmbws/ifmbws.asmx/getPayments?chavebackoffice=0000-0000-0000-0000&entidade=11604&subentidade=999&dtHrInicio=23-05-2012%2000%3A00%3A00&dtHrFim=23-05-2012%2023%3A59%3A59&referencia=%20&Valor=%20&sandbox=0'
```

--------------------------------

### Documentation API

Source: https://www.ifthenpay.com/docs/en/api/directdebit

Provides access to documentation related to Direct Debit authorizations, including PDF generation and file uploads.

```APIDOC
## Documentation API

### GET /api/v1/authorization/pdf/{mandateId}

#### Description
Retrieves a PDF document for a specific Direct Debit authorization.

#### Method
GET

#### Endpoint
/api/v1/authorization/pdf/{mandateId}

#### Parameters
##### Path Parameters
- **mandateId** (string) - Required - The ID of the mandate for which to generate the PDF.

### POST /api/v1/authorization/upload/{mandateId}

#### Description
Uploads a document related to a Direct Debit authorization.

#### Method
POST

#### Endpoint
/api/v1/authorization/upload/{mandateId}

#### Parameters
##### Path Parameters
- **mandateId** (string) - Required - The ID of the mandate to which the document is related.
```

--------------------------------

### Send JSON Request Body using cURL

Source: https://www.ifthenpay.com/docs/en/api/pix

This snippet demonstrates how to send a JSON request body to the Ifthenpay API using the cURL command-line tool. It includes common fields for order processing such as order ID, amount, redirect URL, and customer details. Ensure all required fields are correctly populated before sending.

```shell
curl -X POST https://api.ifthenpay.com/v1/payment \ 
-H "Content-Type: application/json" \ 
-d '{ 
  "orderId": "order_45678", 
  "amount": "11.55", 
  "redirectUrl": "https://youraddress.com/status.php", 
  "description": "Order 45678", 
  "customerName": "John Doe", 
  "customerCpf": "74026594025", 
  "customerEmail": "johndoe@example.com", 
  "customerPhone": "+351256245560", 
  "customerAddress": "Main Street", 
  "customerStreetNumber": "123", 
  "customerZipCode": "12345", 
  "customerCity": "New York", 
  "customerState": "New York" 
}'
```

--------------------------------

### POST /status

Source: https://www.ifthenpay.com/docs/en/api/cofidispay

Checks the status of a COFIDIS PAY payment request. Requires a JSON body with cofidisKey and requestId.

```APIDOC
## POST /status

### Description
Checks the status of a COFIDIS PAY payment request. Requires a JSON body with cofidisKey and requestId.

### Method
POST

### Endpoint
/cofidis/status

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
- **cofidisKey** (string) - Required - The unique key assigned by Ifthenpay.
- **requestId** (string) - Required - The token associated with the payment request.

### Request Example
```json
{
  "cofidisKey": "DTD-676985",
  "requestId": "36jvlEhUYeknQ8PHKprR"
}
```

### Response
#### Success Response (200)
- **amount** (string) - The payment amount.
- **description** (string) - A description of the payment.
- **orderId** (string) - The order identifier.
- **status** (string) - The current status of the payment (e.g., "INITIATED").
- **statusCode** (string) - The status code of the payment.
- **statusDateTime** (string) - The date and time of the status update.
- **statusMessage** (string) - A message describing the status.

#### Response Example
```json
[
  {
    "amount": "11.55",
    "description": "Order 45678",
    "orderId": "order_45678",
    "status": "INITIATED",
    "statusCode": "INITIATED",
    "statusDateTime": "28-11-2023 15:50:328",
    "statusMessage": "O pedido aguarda o envio da fatura."
  }
]
```
```

--------------------------------

### POST /mbway - Request New Payment

Source: https://www.ifthenpay.com/docs/en/api/mbway

Initiates a new MB WAY payment request. Requires payment details including amount, merchant key, customer's mobile number, order ID, email, and a description.

```APIDOC
## POST /mbway

### Description
Request a new MB WAY payment.

### Method
POST

### Endpoint
https://api.ifthenpay.com/spg/payment/mbway

### Parameters
#### Request Body
- **amount** (string) - Required - The payment amount (e.g., "10.99"). Decimal separator is ".".
- **mbWayKey** (string) - Required - The MBWAY KEY assigned by ifthenpay.
- **mobileNumber** (string) - Required - The customer's mobile number, including country code separated by '#' (e.g., "351#912345678").
- **orderId** (string) - Required - Maximum length 15. Payment identifier defined by the client (e.g., invoice number, order number).
- **description** (string) - Optional - Maximum length 100. A description for the payment.
- **email** (string) - Optional - Maximum length 100. The customer's email address.

### Request Example
```json
{
  "mbWayKey": "ZZZ-000000",
  "orderId": "1887",
  "amount": "10.99",
  "mobileNumber": "351#912345678",
  "email": "empresa@empresa.com",
  "description": "order 1 payment"
}
```

### Response
#### Success Response (200)
- **Amount** (number) - The amount of the payment.
- **Message** (string) - The status message of the payment (e.g., "Pending").
- **orderId** (string) - The client-defined order identifier.
- **RequestId** (string) - A unique identifier for the payment request.
- **Status** (string) - The status code of the operation (e.g., "000").

#### Response Example
```json
{
  "Amount": 10.99,
  "Message": "Pending",
  "orderId": 1887,
  "RequestId": "i2szvoUfPYBMWdSxqO3n",
  "Status": "000"
}
```
```

--------------------------------

### Generate MULTIBANCO Payment Reference (Shell Curl)

Source: https://www.ifthenpay.com/docs/en/api/multibanco

This snippet demonstrates how to request a new MULTIBANCO payment reference using cURL. It requires the 'mbKey', 'orderId', and 'amount', along with optional client and payment details. The response includes the generated reference, expiry date, and transaction status.

```Shell
curl https://api.ifthenpay.com/multibanco/reference/init \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "mbKey": "ZZZ-000000",
  "orderId": "1887",
  "amount": "10.99",
  "description": "order 1 payment",
  "url": "https://www.empresa.com",
  "clientCode": 123,
  "clientName": "John Doe",
  "clientEmail": "empresa@empresa.com",
  "clientUsername": "johndoe",
  "clientPhone": 351976543210,
  "expiryDays": "0"
}'
```

--------------------------------

### Enable or Disable Payment Link and PINPAY Code

Source: https://www.ifthenpay.com/docs/en/api/pbl

This endpoint allows you to enable or disable a payment link and its associated PINPAY code by specifying the desired action in the request URL.

```APIDOC
## POST /gateway/{GATEWAY_KEY}/{REQUEST_STATUS}

### Description
Enables or disables a payment link and its associated PINPAY code.

### Method
POST

### Endpoint
`/gateway/{GATEWAY_KEY}/{REQUEST_STATUS}`

### Parameters
#### Path Parameters
- **GATEWAY_KEY** (string) - Required - The gateway key for the transaction.
- **REQUEST_STATUS** (string) - Required - The action to perform, either 'enable' or 'disable'.

#### Query Parameters
None

#### Request Body
- **url** (string) - Required - The Redirect Url returned from the request. It is essential to store this Redirect Url from the response, as it uniquely identifies the "Pay by Link" transaction.

### Request Example
```json
{
  "url": "https://gateway.ifthenpay.com/url/08c6nh97sn or https://pinpay.pt/08c6nh97sn"
}
```

### Response
#### Success Response (200)
- **Message** (string) - Indicates the status of the operation (e.g., "enabled").
- **Status** (string) - The status code of the operation (e.g., "0").

#### Response Example
```json
{
  "Message": "enabled",
  "Status": "0"
}
```
```

--------------------------------

### Direct Debit Webhooks

Source: https://www.ifthenpay.com/docs/en/guides/callback

Handles callback and notification URLs for Direct Debit payments, providing details on transaction status and confirmation.

```APIDOC
## Direct Debit Webhooks

### Description
This section describes the callback and notification URLs for Direct Debit payments. The callback URL is triggered after payment confirmation, while the notification URL provides the status of individual collection attempts.

### Callback URL
**Endpoint:** `https://www.yoursite.com/callback.php`

**Method:** GET

**Query Parameters:**
- **anti_phishing_key** (string) - Required - The anti-phishing key that validates the authenticity of the transaction.
- **mandate_id** (string) - Required - The Mandate ID associated with the transaction.
- **transaction_id** (string) - Required - The transaction ID that initiated the direct debit payment.
- **amount** (number) - Required - The total amount of the transaction.
- **payment_datetime** (string) - Required - The date and time when the payment was made (format: DD-MM-YYYY HH:MM:SS).
- **reference** (string) - Required - The direct debit reference used for the payment.

**Example:**
`https://www.yoursite.com/callback.php?anti_phishing_key=my_anti_phishing_key&mandate_id=12345&reference=1021600051424&transaction_id=00065411-98&amount=5.00&payment_datetime=28-10-2021 10:55:21`

### Notification URL
**Endpoint:** `https://www.yoursite.com/notification.php`

**Method:** GET

**Query Parameters:**
- **mandateId** (string) - Required - The Mandate ID (e.g., 09039807130).
- **transactionId** (string) - Required - The Transaction ID (e.g., KL83NVuf0fy8GYkpohVo).
- **amount** (number) - Required - The total amount of the transaction (e.g., 0.01).
- **currency** (string) - Required - The transaction currency (e.g., EUR).
- **collectionDate** (string) - Required - The scheduled collection date (e.g., 2025-04-17).
- **reference** (string) - Required - The transaction reference (e.g., 6CCEA46379).
- **status** (string) - Required - The status of the transaction (e.g., PROCESSING). Possible values: PENDING, PROCESSING, ACTIVE, COMPLETED, ERROR, CANCELED.
- **code** (string) - Required - The status code returned (e.g., 0000). 0000 indicates SUCCESS.

**Example:**
`https://www.yoursite.com/notification.php?mandateId=09039807130&transactionId=KL83NVuf0fy8GYkpohVo&amount=0.01&currency=EUR&collectionDate=2025-04-17&reference=6CCEA46379&status=PROCESSING&code=0000`
```

--------------------------------

### Retrieve List of Payments - JSON (Shell Curl)

Source: https://www.ifthenpay.com/docs/en/api/list-of-payments

This snippet demonstrates how to retrieve a list of payments in JSON format using a Shell Curl command. It requires parameters such as chavebackoffice, entidade, subentidade, and date/time range. The response is a JSON array of payment objects.

```Shell
curl 'https://ifthenpay.com/ifmbws/ifmbws.asmx/getPaymentsJsonV2?chavebackoffice=0000-0000-0000-0000&entidade=11604&subentidade=999&dtHrInicio=23-05-2012%2000%3A00%3A00&dtHrFim=23-05-2012%2023%3A59%3A59&referencia=%20&Valor=%20&sandbox=0'
```

--------------------------------

### Payment Processing API

Source: https://www.ifthenpay.com/docs/en/api/cofidispay

This endpoint is used to initiate a payment transaction. It requires detailed information about the order, customer, and billing/delivery addresses.

```APIDOC
## POST /websites/ifthenpay_en

### Description
Initiates a payment transaction with IfthenPay, requiring comprehensive order and customer details.

### Method
POST

### Endpoint
/websites/ifthenpay_en

### Parameters
#### Query Parameters
None

#### Request Body
- **cofidisKey** (string) - Required - The API key for authentication.
- **orderId** (string) - Required - Unique identifier for the order.
- **amount** (string) - Required - The total amount for the transaction.
- **returnUrl** (string) - Required - The URL to redirect the customer after payment.
- **description** (string) - Optional - A description of the order.
- **customerName** (string) - Optional - The name of the customer.
- **customerVat** (string) - Optional - The VAT number of the customer.
- **customerEmail** (string) - Optional - The email address of the customer.
- **customerPhone** (string) - Optional - The phone number of the customer.
- **billingAddress** (string) - Optional - The billing address of the customer.
- **billingZipCode** (string) - Optional - The billing zip code of the customer.
- **billingCity** (string) - Optional - The billing city of the customer.
- **deliveryAddress** (string) - Optional - The delivery address for the order.
- **deliveryZipCode** (string) - Optional - The delivery zip code for the order.
- **deliveryCity** (string) - Optional - The delivery city for the order.

### Request Example
```json
{
  "cofidisKey": "YOUR_COFIDIS_KEY",
  "orderId": "order_45678",
  "amount": "11.55",
  "returnUrl": "https://youraddress.com/status.php",
  "description": "Order 45678",
  "customerName": "John Doe",
  "customerVat": "123456789",
  "customerEmail": "johndoe@example.com",
  "customerPhone": "+351256245560",
  "billingAddress": "123 Main Street",
  "billingZipCode": "12345",
  "billingCity": "New York",
  "deliveryAddress": "456 Elm Street",
  "deliveryZipCode": "67890",
  "deliveryCity": "Los Angeles"
}
```

### Response
#### Success Response (200)
- **status** (string) - The status of the payment transaction.
- **paymentUrl** (string) - The URL where the customer can complete the payment.

#### Response Example
```json
{
  "status": "success",
  "paymentUrl": "https://pay.ifthenpay.com/ செலுத்த/your-payment-link"
}
```
```

--------------------------------

### Retrieve Payment Limits

Source: https://www.ifthenpay.com/docs/en/api/cofidispay

Retrieves the maximum and minimum payment limits for a COFIDIS PAY client.

```APIDOC
## GET /limits/{COFIDIS_KEY}

### Description
Retrieves the maximum and minimum financing limits for a COFIDIS PAY client. This information can be used to determine if an order amount qualifies for Cofidis Pay financing.

### Method
GET

### Endpoint
/limits/{COFIDIS_KEY}

### Parameters
#### Path Parameters
- **COFIDIS_KEY** (string) - Required - The unique key provided by Ifthenpay for your merchant account.

### Response
#### Success Response (200)
- **minimumAmount** (number) - The minimum allowed amount for financing.
- **maximumAmount** (number) - The maximum allowed amount for financing.

#### Response Example
```json
{
  "minimumAmount": 50.00,
  "maximumAmount": 1000.00
}
```
```

--------------------------------

### Request New MB WAY Payment using cURL

Source: https://www.ifthenpay.com/docs/en/api/mbway

This snippet demonstrates how to initiate a new MB WAY payment request using a cURL command. It requires the 'mbWayKey', 'orderId', 'amount', 'mobileNumber', 'email', and 'description' as JSON payload. The API endpoint is 'https://api.ifthenpay.com/spg/payment/mbway'.

```shell
curl https://api.ifthenpay.com/spg/payment/mbway \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "mbWayKey": "ZZZ-000000",
  "orderId": "1887",
  "amount": "10.99",
  "mobileNumber": "351#912345678",
  "email": "empresa@empresa.com",
  "description": "order 1 payment"
}'
```

--------------------------------

### Successful Response for List of Payments

Source: https://www.ifthenpay.com/docs/en/api/list-of-payments-rest

This JSON structure represents a successful response from the LIST OF PAYMENTS API. It includes a 'message' and 'status' indicating success, and a 'payments' array containing details of each retrieved payment, such as amount, entity, fee, and payment date.

```json
{
  "message": "OK",
  "status": 200,
  "payments": [
    {
      "amount": 22750,
      "entity": "MB",
      "fee": 0.86,
      "netAmount": 22749.14,
      "orderId": "000017273",
      "paymentDate": "21-10-2024 15:41:00",
      "procDate": "20241021",
      "reference": "007875810",
      "requestId": "wIh3HzFByfmj75Adl98x",
      "subEntity": "XXX-000000",
      "terminal": "5-0000000000-CAIXA GERAL DE "
    }
  ]
}
```

--------------------------------

### Successful Sandbox Payment Reference Response

Source: https://www.ifthenpay.com/docs/en/api/multibanco

This JSON object represents a successful response when requesting a new MULTIBANCO payment reference in sandbox mode. It contains details like the amount, entity, expiry date, order ID, payment reference, and request ID.

```json
{
  "Amount": 10.99,
  "Entity": 11990,
  "ExpiryDate": "30-10-2021",
  "Message": "Success",
  "OrderId": 1887,
  "Reference": "000000291",
  "RequestId": "5Qd8gtWLAEUJ6n0lkS5g",
  "Status": "0"
}
```

--------------------------------

### Successful API Response for Payment Link and PINPAY Code

Source: https://www.ifthenpay.com/docs/en/api/pbl

This JSON structure represents a successful response from the IfthenPay API after requesting a new payment link and PINPAY code. It contains the generated PinCode, a redirect URL, and the specific Pinpay URL.

```json
{
  "PinCode": 1234567890,
  "RedirectUrl": "https://gateway.ifthenpay.com/url/r54aiUE1dX",
  "PinpayUrl": "https://pinpay.pt/1234567890"
}
```

--------------------------------

### Generate JWT Bearer Token using Shell Curl

Source: https://www.ifthenpay.com/docs/en/api/directdebit

This snippet demonstrates how to generate a JWT bearer token using Shell Curl. It requires the 'backofficeKey' and sends a POST request to the authentication endpoint. The generated token is used for subsequent API calls.

```shell
curl https://services.ifthenpay.com/directdebit/api/v1/auth/token \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "backofficeKey": "XXXX-XXXX-XXXX-XXXX"
}'
```

--------------------------------

### Check Payment Status

Source: https://www.ifthenpay.com/docs/en/api/pix

Checks the status of a PIX payment using a request ID.

```APIDOC
## GET /pix/payment/status/

### Description
Checks the status of a PIX payment.

### Method
GET

### Endpoint
`/pix/payment/status/`

### Parameters
#### Path Parameters
None

#### Query Parameters
- **requestId** (string) - Required - The ID of the request to check.

#### Request Body
None

### Request Example
```bash
curl 'https://api.ifthenpay.com/pix/payment/status/?requestId=i2szvoUfPYBMWdSxqO3n'
```

### Response
#### Success Response (200)
- **Message** (string) - Indicates the success of the operation.
- **Status** (string) - The status of the payment.

#### Response Example
```json
{
  "Message": "Success",
  "Status": "0"
}
```
```

--------------------------------

### Direct Debit Authorization API

Source: https://www.ifthenpay.com/docs/en/api/directdebit

Manages Direct Debit authorizations, including creating new authorizations, listing existing ones, and updating them.

```APIDOC
## Direct Debit Authorization API

### POST /api/v1/authorization/create

#### Description
Creates a new Direct Debit authorization.

#### Method
POST

#### Endpoint
/api/v1/authorization/create

### GET /api/v1/authorization/list

#### Description
Retrieves a list of Direct Debit authorizations.

#### Method
GET

#### Endpoint
/api/v1/authorization/list

### PUT /api/v1/authorization/update/{mandateId}

#### Description
Updates an existing Direct Debit authorization identified by its mandate ID.

#### Method
PUT

#### Endpoint
/api/v1/authorization/update/{mandateId}

#### Parameters
##### Path Parameters
- **mandateId** (string) - Required - The ID of the mandate to update.
```

--------------------------------

### PIX Payment Status Check

Source: https://www.ifthenpay.com/docs/en/api/pix

Checks the status of a previously initiated PIX payment request.

```APIDOC
## GET /payment/status/

### Description
Checks the status of a PIX payment request using its unique identifier.

### Method
GET

### Endpoint
/payment/status/

### Parameters
#### Path Parameters
None

#### Query Parameters
- **payment_id** (string) - Required - The unique identifier of the payment request.

#### Request Body
None

### Request Example
```
GET /payment/status/?payment_id=some_payment_id
```

### Response
#### Success Response (200)
- **payment_id** (string) - The unique identifier for the payment request.
- **status** (string) - The current status of the payment (e.g., 'PENDING', 'PAID', 'CANCELLED').

#### Response Example
```json
{
  "payment_id": "some_payment_id",
  "status": "PAID"
}
```
```

--------------------------------

### Check PIX Payment Status Response Schema (JSON)

Source: https://www.ifthenpay.com/docs/en/api/pix

This is the JSON schema for a successful PIX payment status check response. It includes a message indicating success and a status code for the payment.

```json
{
  "Message": "Success",
  "Status": "0"
}
```

--------------------------------

### Direct Debit Collection API

Source: https://www.ifthenpay.com/docs/en/api/directdebit

Handles Direct Debit collections, including creating new collection requests, listing collections, updating transaction statuses, and cancelling collections.

```APIDOC
## Direct Debit Collection API

### POST /api/v1/collection/create/{mandateId}

#### Description
Creates a new Direct Debit collection request associated with a mandate.

#### Method
POST

#### Endpoint
/api/v1/collection/create/{mandateId}

#### Parameters
##### Path Parameters
- **mandateId** (string) - Required - The ID of the mandate for which to create a collection.

### GET /api/v1/collection/list

#### Description
Retrieves a list of Direct Debit collections.

#### Method
GET

#### Endpoint
/api/v1/collection/list

### PUT /api/v1/collection/update/{transactionId}

#### Description
Updates the status of a Direct Debit collection transaction.

#### Method
PUT

#### Endpoint
/api/v1/collection/update/{transactionId}

#### Parameters
##### Path Parameters
- **transactionId** (string) - Required - The ID of the transaction to update.

### DELETE /api/v1/collection/cancel/{transactionId}

#### Description
Cancels a Direct Debit collection transaction.

#### Method
DELETE

#### Endpoint
/api/v1/collection/cancel/{transactionId}

#### Parameters
##### Path Parameters
- **transactionId** (string) - Required - The ID of the transaction to cancel.
```

--------------------------------

### Check Cofidis PAY Payment Status

Source: https://www.ifthenpay.com/docs/en/api/cofidispay

Checks the status of a Cofidis PAY payment request. Requires the cofidisKey and requestId in the JSON body. Returns an array of payment status objects.

```shell
curl https://api.ifthenpay.com/cofidis/status \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "cofidisKey": "DTD-676985",
  "requestId": "36jvlEhUYeknQ8PHKprR"
}'
```

--------------------------------

### Check Payment Status

Source: https://www.ifthenpay.com/docs/en/api/cofidispay

Checks the status of a previously initiated COFIDIS PAY payment request.

```APIDOC
## POST /status

### Description
Checks the current status of a COFIDIS PAY payment request. This endpoint requires the `OrderID` of the payment to be checked.

### Method
POST

### Endpoint
/status

### Parameters
#### Query Parameters
- **OrderID** (string) - Required - The unique identifier of the order for which to check the payment status.

### Request Example
```json
{
  "OrderID": "12345"
}
```

### Response
#### Success Response (200)
- **status** (string) - The current status of the payment (e.g., PENDING, PAID, FAILED, CANCELLED).
- **message** (string) - A message providing more details about the payment status.

#### Response Example
```json
{
  "status": "PAID",
  "message": "Payment has been successfully processed."
}
```
```

--------------------------------

### Check MB WAY Payment Status using cURL

Source: https://www.ifthenpay.com/docs/en/api/mbway

This snippet shows how to check the status of an MB WAY payment using a cURL command. It requires the 'mbWayKey' and 'requestId' as query parameters. The API endpoint is 'https://api.ifthenpay.com/spg/payment/mbway/status'.

```shell
curl 'https://api.ifthenpay.com/spg/payment/mbway/status?mbWayKey=ZZZ-000000&requestId=i2szvoUfPYBMWdSxqO3n'
```

--------------------------------

### POST /api/v1/auth/token

Source: https://www.ifthenpay.com/docs/en/api/directdebit

Generates a JWT bearer token for authenticating subsequent API requests. This token is required for all other API operations.

```APIDOC
## POST /api/v1/auth/token

### Description
Generates a JWT bearer token that serves as secure authentication for the remaining API methods. All subsequent API calls require this bearer token in the header.

### Method
POST

### Endpoint
/api/v1/auth/token

### Parameters
#### Request Body
- **backofficeKey** (string) - Required - The Ifthenpay backoffice key provided for authentication. Max length: 19.

### Request Example
```json
{
  "backofficeKey": "XXXX-XXXX-XXXX-XXXX"
}
```

### Response
#### Success Response (201)
- **token_type** (string) - The type of token, typically 'Bearer'.
- **access_token** (string) - The generated JWT access token.
- **expiry_date** (string) - The expiration date and time of the token.

#### Response Example
```json
{
  "data": {
    "token_type": "Bearer",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiry_date": "2024-11-05 13:49:58"
  }
}
```
```

=== COMPLETE CONTENT === This response contains all available snippets from this library. No additional content exists. Do not make further requests.