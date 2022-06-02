# Vouch Digital - ADDRESS BOOK

Address Book RESTfull API

## Installation

Use the package manager NPM or YARN to install dependencies.

```bash
npm install
```

## Usage

```
# Add your own MongoDB connection url in mongoDB_Url
mongoDB_Url = ''
```

## Endpoints

### Send all data as x-www-form-urlencoded data.

#### Generate JWT Token

Make GET Request
```
http://localhost:3000/get-token
```
Successfull will return a JWT Token.

Copy the token and pass it in headers in every call to the API as 'x-access-token' header

Read all contacts, send a GET Request to below endpoint.

Add a contact, send a POST Request.

Delete all contacts, send a DELETE Request.
```
http://localhost:3000/address-book
```
Read a specific contact, send a GET Request to below endpoint.

Update a specified contact, send a PATCH Request.

Delete a specific contact, send a DELETE Request.

Add person name and contact number as url parameters.
```
http://localhost:3000/address-book/:personName/:contactNumber
```
