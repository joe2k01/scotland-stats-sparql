import { areas, dataSetQuery } from "./queries";

const url = "http://statistics.gov.scot/sparql.json";

type Result = {
  head: {
    vars: [string];
  };
  results: {
    bindings: [
      {
        [key: string]: { [key: string]: string };
      }
    ];
  };
};

const query = (q: string) => {
  return new Promise<Result>((resolve, reject) => {
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: `query=${encodeURI(q)}`,
    })
      .then((res) => {
        res
          .json()
          .then((data) => resolve(data))
          .catch((err) => reject(err));
      })
      .catch((err) => reject(err));
  });
};

const getAreas = () => {
  return query(areas);
};

const getDataSet = (
  areaUri: string,
  datasetUri: string,
  indicator: string,
  indicatorValue: string
) => {
  return new Promise<Result>(async (resolve, reject) => {
    const q = dataSetQuery(areaUri, datasetUri, indicator, indicatorValue);
    try {
      const response = await query(q);
      resolve(response);
    } catch (err) {
      reject(err);
    }
  });
};

export { getAreas, getDataSet };
export type { Result };
