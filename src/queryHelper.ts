import { areas } from "./queries";

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

const getAreas = () => {
  return new Promise<Result>((resolve, reject) => {
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: `query=${encodeURI(areas)}`,
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

export { getAreas };
export type { Result };
