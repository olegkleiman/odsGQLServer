import client from './connection.js';
const elasticCategoriesIndexName = 'ods_categories';
const elasticDatasetsIndexName = 'ods_datasets';

import _categories from './data/ods_categories.json';
import _datasets from './data/ods_datasets.json';

const process = () => {

    try {
      _categories.map( async(item) => {
        await client.index({
          index: elasticCategoriesIndexName,
          type: 'doc',
          id: item.id,
          body: {
            name: item.name,
            heb_name: item.heb_name,
            description: item.description,
            heb_description: item.heb_description
          }
        })
      })

      _datasets.map( async(dataset) => {
        await client.index({
          index: elasticDatasetsIndexName,
          type: 'doc',
          id: dataset.id,
          body: {
               name: dataset.name,
               heb_name: dataset.heb_name,
               type: dataset.type,
               description: dataset.description,
               heb_description: dataset.heb_description,
               categoryId: dataset.categoryId,
               id: dataset.id,
               url: dataset.url
          }
        })
      })

    } catch( err ) {
      console.error(err);
    }
};

process();
