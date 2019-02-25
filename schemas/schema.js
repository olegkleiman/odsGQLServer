import { gql } from 'apollo-server';

const typeDefs = gql`
  interface INode  {
    id: ID!
  }

  scalar Date

  enum DataSetType {
    REPORT
    GSHEET
    API
  }

  type DataSet implements INode {
    id: ID!

    name: String!
    heb_name: String!
    type: DataSetType
    categoryIds: [Int]
    url: String
  }

  type Category implements INode {
    id: ID!

    name: String!
    heb_name: String!
    datasets: [DataSet]
  }

  type Query {
    datasets: [DataSet]
    dataset(id: ID!): DataSet
    categories: [Category]
    category(id: ID!): Category
  }
`;

export default typeDefs;
