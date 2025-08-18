import gql from "graphql-tag";

const GetUser = gql`
  query GetUser {
    getMe {
      id
      firstName
      lastName
      email
      favoriteActivityIds
      role
    }
  }
`;

export default GetUser;
