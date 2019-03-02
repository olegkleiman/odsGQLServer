import { gql } from 'apollo-server';

const typeDefs = gql`

  scalar DateTime

  interface INode  {
    id: ID!
  }

  enum DataSetType {
    REPORT
    COMPOUND
    API
  }

  type DataSetVisualization {
    name: String!
    heb_name: String!
    url: String
  }

  type DataSet implements INode {
    id: ID!

    name: String!
    heb_name: String!
    type: DataSetType
    categoryIds: [Int]
    url: String
    visualizations: [DataSetVisualization]
    data_url: String
    description: String
    heb_description: String
    whenPublished: DateTime
  }

  type Category implements INode {
    id: ID!

    name: String!
    heb_name: String!
    description: String
    heb_description: String
    datasets: [DataSet]
  }

  union SearchResult = DataSet | Category

  type Query {
    datasets: [DataSet]
    dataset(id: ID!): DataSet
    categories: [Category]
    category(id: ID!): Category

    search(contains: String!): [SearchResult]
  }
`;

export default typeDefs;
