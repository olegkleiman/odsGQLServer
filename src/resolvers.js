// @flow
import _ from 'lodash';
import DataLoader from 'dataloader';
import elasticsearch from 'elasticsearch';
import esb from 'elastic-builder';
import casual from 'casual';

import _datasets from '../elastic/data/ods_datasets.json';

const elasticIndexName = 'ods_categories';
const elasticDatasetsIndexName = 'ods_datasets';

const datasetsLoader = new DataLoader(Ids => _findBy('categoryId', ...Ids),
                                        { cache: false });

const _findBy = async(field, ...values) => {

  try {
    const requestBody = esb.requestBodySearch()
      .query(
          esb.boolQuery()
          .filter(esb.termsQuery(field, values))
      )
    const response = await elasticClient.search({
      index: elasticDatasetsIndexName,
      type: 'doc',
      body: requestBody.toJSON()
    });

    const dataSets = response.hits.hits.map( hit => {
      return hit._source;
    });
    const dataSetsByCategoryId = _.groupBy(dataSets, field);

    return values.map( val =>
      dataSetsByCategoryId[val] || []
    );
  } catch( err ) {
    return Promise.reject(err);
  }
}

function isMockMode(): boolean {

  let mockToken = process.argv.find( (arg: string) => {
    return arg === "--mock"
  });

  return mockToken;
}

const esHost = isMockMode() ? 'localhost' : '10.1.70.47';
var elasticClient = new elasticsearch.Client({
  host: `${esHost}:9200`
  //log: 'trace'
  // selector: function (hosts) {
  // }
});

elasticClient.cluster.health({}, function(err, resp, status) {
  console.log("Elastic Health: ", resp);
})

export const resolvers = {

    Query: {
      datasets: async(_, args, context, info) => {

        let requestBody = esb.requestBodySearch()
                          .query(
                              esb.matchAllQuery()
                          );
        const response = await elasticClient.search({
          index: elasticDatasetsIndexName,
          type: 'doc',
          body: requestBody.toJSON()
        });
        return response.hits.hits.map( (hit) => {
              return {
                id: hit._id,
                name: hit._source.name,
                heb_name: hit._source.heb_name,
                type: hit._source.type,
                visualizations: hit._source.visualizations,
                data_url: hit._source.data_url,
                description: hit._source.description,
                heb_description: hit._source.heb_description,
                whenPublished: hit._source.whenPublished
              }
          })
      },
      dataset: async (parent, {id}) => {

        const response = await elasticClient.get({
          index: elasticDatasetsIndexName,
          type: 'doc',
          id: id
        });

        // console.log(response);

        return {
          id: id,
          name: response._source.name,
          type: response._source.type,
          categoryIds: [response._source.categoryId],
          visualizations: response._source.visualizations,
          data_url: response._source.data_url,
          description: response._source.description,
          heb_description: response._source.heb_description,
          whenPublished: response._source.whenPublished
        };
      },
      categories: async (_, args, context, info) => {
        const requestBody = esb.requestBodySearch()
                          .query(
                              esb.matchAllQuery()
                          );
        const response = await elasticClient.search({
          index: elasticIndexName,
          type: 'doc',
          body: requestBody.toJSON()
        });
        return response.hits.hits.map( (hit) => {
              return {
                id: hit._id,
                heb_name: hit._source.heb_name,
                name: hit._source.name,
                description: hit._source.description,
                heb_description: hit._source.heb_description
              }
          })
      },
      category: async (_, {id}, context, info) => {

        const response = await elasticClient.get({
          index: elasticIndexName,
          type: 'doc',
          id: id
        });

        return {
          id: id,
          name: response._source.name,
          heb_name: response._source.heb_name
        };
      },
      search: async(_, {contains}, context, info) => {
        const requestBody = esb.requestBodySearch()
        .query(
                esb.queryStringQuery(contains)
        );

        const response = await elasticClient.search({
          index: [elasticIndexName, elasticDatasetsIndexName],
          body: requestBody.toJSON()
        });

        const res = [];
        response.hits.hits.map( hit => {
          res.push(hit._source);
        });

        return res;
      }
    },

    DataSet: {
      __isTypeOf: (obj) => {
        if( obj.type ) // this property (type) is specific for DataSet
          return "DataSet";

        return null;
      }
    },

    Category: {
      __isTypeOf: (obj) => {
        if( !obj.type )
          return "Category";

        return null;
      },
      datasets: async(parent) => {

        return await datasetsLoader.load(parent.id);

      }
    }
};
