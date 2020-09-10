# apollo engine graphql demo with postgreSQL

git clone https://github.com/doitintl/gql-demo.git
cd gql-demo  
npm i  

# setup a postgreSQL database
use the /src/db/ddl.sql file to create and seed a books table  

once the db is configured run with the following  
`
POSTGRES_HOST=<ip-address-of-pg-server> PG_PASSWORD=<postgres-user-password>  node_modules/.bin/ts-node src/index.ts
`

see src/db/dbPoolconfig.ts for other configuration values and defaults  


# kubernetes
see kubernetes/deployment-development.yaml  

# examples
books from the database  
`
{
  dbBooks
  {
    bookTitle
    bookId,
    bookAuthor
  }
}
`

mutation to get a JWT  
`
mutation {
  generateUserAuthToken(
    authorizationTokenRequest: {
      userName: "testing",
      password: "testing"
  	}
  )
  {
    token
  }
}
`

for client side react development see https://www.apollographql.com/docs/react/get-started/  