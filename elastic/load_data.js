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
            id: item.id,
            name: item.name,
            heb_name: item.heb_name,
            description: item.description,
            heb_description: item.heb_description,
          }
        })
      });
      console.log('Categories indexed');

      _datasets.map( async(dataset) => {

        const body = {
             name: dataset.name,
             heb_name: dataset.heb_name,
             type: dataset.type,
             description: dataset.description,
             heb_description: dataset.heb_description,
             categoryId: dataset.categoryId,
             id: dataset.id,
             url: dataset.url,
             data_url: dataset.data_url,
             description: dataset.description,
             heb_description: dataset.heb_description,
             visualizations: dataset.visualizations,
             whenPublished: dataset.whenPublished
        };
        // console.log(body);

        const resp = await client.index({
          index: elasticDatasetsIndexName,
          type: 'doc',
          id: dataset.id,
          body: body
        });
        // console.log(resp);
      });
      console.log('Datasets indexed')

    } catch( err ) {
      console.error(err);
    }
};

process();
