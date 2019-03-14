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

  type DataSetVisualization implements INode {
    id: ID!

    name: String
    heb_name: String
    url: String!
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

  type PageInfo {
    endCursor: String
    startCursor: String
    hasNextPage: Boolean
    hasPreviousPage: Boolean
  }

  type DataSetEdge {
    cursor: String!
    node: DataSet
  }

  type DataSetsConnection {
      edges: [DataSetEdge]!
      pageInfo: PageInfo
      totalCount: Int!
  }

  type ValidatedUser implements INode {
    id: ID!

    email: [String]!
    name: String!
    role: String!
  }

  type Query {

    dataset(id: ID!): DataSet
    categories: [Category]
    category(id: ID!): Category

    datasets(first: Int!,
             after: String,
             categoryId: ID) : DataSetsConnection

    search(contains: String!): [SearchResult]
    validatedUsers: [ValidatedUser]
  }

  input DataSetInput {
    clientMutationId: String

    name: String!
    heb_name: String!
    description: String!
    heb_description: String!
    type: String!
    categoryIds: [Int]
    whenPublished: DateTime
  }

  type AddDataSetPayload {
    dataSetEdge: DataSetEdge!
    clientMutationId: String
  }

  type Mutation {
    addDataSet(input: DataSetInput): AddDataSetPayload
    validateUserEmail(input: String): ValidatedUser
  }
`;

export default typeDefs;
