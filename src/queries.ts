const areas = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                SELECT DISTINCT ?areaname ?areauri
                WHERE {  
                ?obs <http://purl.org/linked-data/cube#dataSet> <http://statistics.gov.scot/data/public-transport>.
                ?obs <http://purl.org/linked-data/sdmx/2009/dimension#refArea>  ?areauri .
                ?areauri rdfs:label ?areaname .
                }`;

const dataSetQuery = (
  areaUri: string,
  dataSetUri: string,
  indicator: string,
  indicatorValue: string
) => `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT DISTINCT ?periodname ?value
        WHERE {  
        ?obs <http://purl.org/linked-data/cube#dataSet> <${dataSetUri}>.
        ?obs <http://purl.org/linked-data/sdmx/2009/dimension#refArea>  <${areaUri}> .
        ?obs <http://statistics.gov.scot/def/measure-properties/count> ?value .
        ?obs <${indicator}> <${indicatorValue}> .
        ?obs <http://purl.org/linked-data/sdmx/2009/dimension#refPeriod> ?perioduri .
        ?perioduri rdfs:label ?periodname .
        }`;

export { areas, dataSetQuery };
