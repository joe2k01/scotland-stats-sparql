const areas = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                SELECT DISTINCT ?areaname ?areauri
                WHERE {  
                ?obs <http://purl.org/linked-data/cube#dataSet> <http://statistics.gov.scot/data/public-transport>.
                ?obs <http://purl.org/linked-data/sdmx/2009/dimension#refArea>  ?areauri .
                ?areauri rdfs:label ?areaname .
                }`;

export { areas };
