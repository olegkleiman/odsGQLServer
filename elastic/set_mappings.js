import client from './connection.js';

const elasticIndexName = 'ods_categories';
const elasticDatasetsIndexName = 'ods_datasets';
const elasticIndexUsersName = 'ods_users';

const process = async () => {

  try {

    // process users index
    let isIndexExists = await client.indices.exists({
      index: elasticIndexUsersName
    });

    if( isIndexExists ) {
      console.log(`${elasticIndexUsersName} is already exists. Deleting...`);
      await client.indices.delete({
        index: elasticIndexUsersName,
      });
      console.log(`${elasticIndexUsersName} was deleted`);
    }

    console.log(`Creating ${elasticIndexUsersName} index`);
    let resp = await client.indices.create({
        index: elasticIndexUsersName,
        // type: 'doc',
        timeout: '10m',
        body: { }
      });
    console.log(`${elasticIndexUsersName} is created`);
    await client.indices.putMapping({
        index: elasticIndexUsersName,
        type: 'doc',
        timeout: '10m',
        body: {
           "properties": {
               "email" : { "type": "keyword" },
               "name": { "type": "text"},
               "role": {"type": "text"},
           }
         }
    });
    console.log(`${elasticIndexUsersName} is mapped`);

    // process categories index
    isIndexExists = await client.indices.exists({
      index: elasticIndexName
    })

    if( isIndexExists ) {
      console.log(`${elasticIndexName} is already exists. Deleting...`)
      await client.indices.delete({
        index: elasticIndexName,
      });
      console.log(`${elasticIndexName} was deleted`);
    }

    console.log(`Creating ${elasticIndexName} index`);
    resp = await client.indices.create({
        index: elasticIndexName,
        // type: 'doc',
        timeout: '10m',
        body: { }
      });
    console.log(`${elasticIndexName} is created`);

    await client.indices.putMapping({
        index: elasticIndexName,
        type: 'doc',
        timeout: '10m',
        body: {
           "properties": {
               "name" : { "type": "text" },
               "heb_name": { "type": "text"},
               "description": {"type": "text"},
               "heb_description": {"type": "text"},
               "id": { "type": "short"}
           }
         }
    });
    console.log(`${elasticIndexName} is mapped`);

    // Process datasets index
    isIndexExists = await client.indices.exists({
      index: elasticDatasetsIndexName
    })

    if( isIndexExists ) {
      console.log(`${elasticDatasetsIndexName} is already exists. Deleting...`)
      await client.indices.delete({
        index: elasticDatasetsIndexName,
      });
      console.log(`${elasticDatasetsIndexName} was deleted`);
    }

    console.log(`Creating ${elasticDatasetsIndexName} index`);
    resp = await client.indices.create({
        index: elasticDatasetsIndexName,
        // type: 'doc',
        timeout: '10m',
        body: { }
      });
    console.log(`${elasticDatasetsIndexName} is created`);

    await client.indices.putMapping({
        index: elasticDatasetsIndexName,
        type: 'doc',
        timeout: '10m',
        body: {
           "properties": {
               "name" : { "type": "text" },
               "heb_name": { "type": "text"},
               "type": { "type": "keyword" },
               "description": {"type": "text"},
               "heb_description": {"type": "text"},
               "categoryIds": { "type": "short" },
               "id": { "type": "short"},
               "url" : { "type": "keyword" },
               "data_url": { "type": "keyword" },
               "description": { "type": "text" },
               "heb_description": { "type": "text" },
               "visualizations" : {
                 "properties": {
                   "name": { "type": "text" },
                   "heb_name": { "type": "text" },
                   "id": { "type": "short"},
                   "url": {
                     "type": "text",
                     "fields": {
                        "keyword": {
                          "type": "keyword",
                          "ignore_above": 256
                        }
                    }
                   }
                 }
               },
               "whenPublished": { "type": "date" }
           }
         }
    });
    console.log(`${elasticDatasetsIndexName} is mapped`);

  } catch( err ) {
    console.error(err);
  }
}

process();
