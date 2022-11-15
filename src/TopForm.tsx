import { Dispatch, SetStateAction } from "react";
import { getDataSet, Result } from "./queryHelper";

interface Request {
  area: number;
  metric: string;
}

type ExtractedData = {
  [key: string]: {
    years: number[];
    values: number[];
  };
};

interface TopFormI {
  areas: Result;
  itemsToCompare: number;
  requests: Request[];
  setRequests: Dispatch<SetStateAction<Request[]>>;
  setChartData: Dispatch<SetStateAction<ExtractedData | undefined>>;
  setYearBounds: Dispatch<React.SetStateAction<number[]>>;
}

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

const TopForm: React.FC<TopFormI> = ({
  areas,
  itemsToCompare,
  requests,
  setRequests,
  setChartData,
  setYearBounds,
}) => {
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

    // Get year bounds
    let lowest = 9999;
    let highest = -1;
    Object.keys(comparisons).forEach((comparison) => {
      const startYear = comparisons[comparison].years[0];
      const endYear =
        comparisons[comparison].years[comparisons[comparison].years.length - 1];

      if (startYear < lowest) lowest = startYear;

      if (endYear > highest) highest = endYear;
    });

    // Pad data
    Object.keys(comparisons).forEach((comparison) => {
      const startDelta = comparisons[comparison].years[0] - lowest;
      for (var i = 0; i < startDelta; i++) {
        comparisons[comparison].values.unshift(0);
      }
      const endDelta =
        highest -
        comparisons[comparison].years[comparisons[comparison].years.length - 1];
      for (var i = 0; i < endDelta; i++) {
        comparisons[comparison].values.push(0);
      }
    });

    setYearBounds([lowest, highest]);
    setChartData(comparisons);
  };
  return (
    <>
      {areas && (
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
                    <option key={`area-${areaIndex}`} value={areaIndex}>
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
      )}
    </>
  );
};

export default TopForm;

export type { Request, ExtractedData };
