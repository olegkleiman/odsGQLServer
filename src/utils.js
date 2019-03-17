import elasticsearch from 'elasticsearch';
import esb from 'elastic-builder';

function isMockMode(): boolean {

  let mockToken = process.argv.find( (arg: string) => {
    return arg === "--mock"
  });

  return mockToken;
}

const _elasticClient = (function elasticClient() {

  var instance;

  function createInstance() {
    const esHost = isMockMode() ? 'localhost' : '10.1.70.47';
    return new elasticsearch.Client({
      host: `${esHost}:9200`,
      //log: 'trace'
      // selector: function (hosts) {
      // }
    });
  }

  return {
    getInstance: () => {
      if( !instance ) {
        instance = createInstance();
      }
      return instance;
    },
    findUser: async (email) => {

      try {

        const requestBody = esb.requestBodySearch()
          .query(
              esb.termQuery('email', email)
        );

        const response = await instance.search({
          index: 'ods_users',
          body: requestBody.toJSON()
        });
        console.log(response);

        return ( response.hits.total > 0 ) ?
          {
            email: response.hits.hits[0]._source.email,
            role: response.hits.hits[0]._source.role,
            name: response.hits.hits[0]._source.name,
            id: response.hits.hits[0]._id
          } : {
            id: '000',
            name: '',
            role: '',
            email: [email]
          };

      } catch( err ) {
        console.error(err);
        return null;
      }

    }
  }


})();

export { _elasticClient };
