import React, { useEffect, useRef, useState } from "react";
import ChartView from "./ChartView";
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
  area: number | undefined;
  metric: string | undefined;
}

type ExtractedData = {
  [key: string]: {
    years: number[];
    values: number[];
  };
};

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
  const [chartData, setChartData] = useState<ExtractedData>();

  useEffect(() => {
    getAreas()
      .then((newAreas) => {
        setAreas(newAreas);
        defaultRequest(0);
      })
      .catch((err) => console.error(err));
  }, []);

  const onSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const comparisons: ExtractedData = {};
    for (let i = 0; i < itemsToCompare; i++) {
      if (
        typeof requests[i].area === "number" &&
        typeof requests[i].metric === "string"
      ) {
        const years: number[] = [];
        const values: number[] = [];
        const areaUri = areas.results.bindings[requests[i].area].areauri.value;
        const metric = metrics[requests[i].metric];
        try {
          const response = await getDataSet(
            areaUri,
            metric[0],
            metric[1],
            metric[2]
          );
          const bindings = response.results.bindings;
          bindings.map((result) => {
            years.push(parseInt(result.periodname.value));
            values.push(parseInt(result.value.value));
          });
          comparisons[
            `${areas.results.bindings[requests[i].area].areaname.value}, ${
              requests[i].metric
            }`
          ] = {
            years,
            values,
          };
        } catch (err) {
          console.error(err);
        }
      }
    }

    setChartData(comparisons);
  };

  const defaultRequest = (index: number) => {
    setRequests((reqs) => {
      const newReqs = reqs;

      // Set defaults
      newReqs[index] = {
        // When this function is called areas is always defined
        area: 0,
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
                          newReqs[index].area = parseInt(ev.target.value);

                          return newReqs;
                        });
                      }}
                    >
                      {Object.keys(areas.results.bindings).map((areaIndex) => (
                        <option
                          key={`area-${areaIndex}`}
                          value={
                            // areas.results.bindings[parseInt(areaIndex)].areauri
                            //   .value
                            areaIndex
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
      {chartData && <ChartView chartData={chartData} />}
    </>
  );
}

export default App;

export type { ExtractedData };
