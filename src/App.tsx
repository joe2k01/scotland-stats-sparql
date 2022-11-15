import React, { useEffect, useRef, useState } from "react";
import { getAreas, getDataSet, Result } from "./queryHelper";

const metrics: {
  [key: string]: string[];
} = {
  "Public transport": [
    "http://statistics.gov.scot/data/public-transport",
    "http://statistics.gov.scot/def/dimension/indicator(publicTransport)",
    "http://statistics.gov.scot/def/concept/indicator-public-transport/total-number-of-vehicle-kilometres-million-on-all-bus-services-in-scotland",
  ],
  "Road Network and Traffic": [
    "http://statistics.gov.scot/data/road-network-traffic",
    "http://statistics.gov.scot/def/dimension/indicator(roadNetworkTraffic)",
    "http://statistics.gov.scot/def/concept/indicator-road-network-traffic/the-total-million-vehicle-kilometres-on-scottish-roads",
  ],
};

interface Request {
  area: string | undefined;
  metric: string | undefined;
}

const maxItems = 32;

function App() {
  const [requests, setRequests] = useState<Request[]>(
    new Array(maxItems).fill({
      area: undefined,
      metric: undefined,
    })
  );
  const [areas, setAreas] = useState<Result>();
  const [itemsToCompare, setItemsToCompare] = useState<number>(1);

  useEffect(() => {
    getAreas()
      .then((newAreas) => {
        setAreas(newAreas);
        defaultRequest(0, newAreas.results.bindings[0].areauri.value);
      })
      .catch((err) => console.error(err));
  }, []);

  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const comparisons: {
      [key: string]: {
        years: number[];
        values: number[];
      };
    } = {};
    var years: number[] = [];
    const values: number[] = [];
    for (let i = 0; i < itemsToCompare; i++) {
      console.log(requests[i]);
      if (
        typeof requests[i].area === "string" &&
        typeof requests[i].metric === "string"
      ) {
        const areaUri = requests[i].area;
        const metric = metrics[requests[i].metric];
        console.log(areaUri, metric);
        getDataSet(areaUri, metric[0], metric[1], metric[2]).then((res) => {
          const bindings = res.results.bindings;
          bindings.map((result) => {
            years.push(parseInt(result.periodname.value));
            values.push(parseInt(result.value.value));
          });
        });
        comparisons[`${areaUri} ${metric}`] = {
          years,
          values,
        };
      }
    }
  };

  const defaultRequest = (index: number, defaultArea?: string) => {
    setRequests((reqs) => {
      const newReqs = reqs;

      // Set defaults
      newReqs[index] = {
        // When this function is called areas is always defined
        area: defaultArea
          ? defaultArea
          : areas!.results.bindings[0].areauri.value,
        metric: "Public transport",
      };

      return newReqs;
    });
  };

  return (
    <>
      {areas && (
        <div className="w-full h-full flex flex-col">
          <div className="bg-sky-300 p-4 w-full flex flex-row justify-between items-center">
            <form onSubmit={onSubmit}>
              <div className="flex flex-col">
                {Array.from({ length: itemsToCompare }).map((_, index) => (
                  <div className="flex flex-row" key={`select-${index}`}>
                    <select
                      onChange={(ev) => {
                        setRequests((reqs) => {
                          const newReqs = reqs;
                          newReqs[index].area = ev.target.value;

                          return newReqs;
                        });
                      }}
                    >
                      {Object.keys(areas.results.bindings).map((areaIndex) => (
                        <option
                          key={`area-${areaIndex}`}
                          value={
                            areas.results.bindings[parseInt(areaIndex)].areauri
                              .value
                          }
                        >
                          {
                            areas.results.bindings[parseInt(areaIndex)].areaname
                              .value
                          }
                        </option>
                      ))}
                    </select>
                    <select
                      onChange={(ev) => {
                        setRequests((reqs) => {
                          const newReqs = reqs;
                          newReqs[index].metric = ev.target.value;

                          return newReqs;
                        });
                      }}
                    >
                      {Object.keys(metrics).map((metric) => (
                        <option key={metric} value={metric}>
                          {metric}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <input type="submit" />
            </form>
            <div className="flex flex-col">
              <p>Items to compare:</p>
              <div className="flex flex-row">
                <button
                  disabled={itemsToCompare === 1}
                  onClick={() =>
                    setItemsToCompare((items) => {
                      const newItems = items - 1;

                      setRequests((reqs) => {
                        const newReqs = reqs;
                        newReqs[items] = { area: undefined, metric: undefined };

                        return newReqs;
                      });

                      return newItems;
                    })
                  }
                >
                  -
                </button>
                {itemsToCompare}
                <button
                  disabled={itemsToCompare === maxItems}
                  onClick={() => {
                    setItemsToCompare((items) => {
                      defaultRequest(items);
                      return items + 1;
                    });
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
