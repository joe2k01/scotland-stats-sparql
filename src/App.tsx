import { useEffect, useState } from "react";
import ChartView from "./ChartView";
import { getAreas, Result } from "./queryHelper";
import TopForm, { ExtractedData, Request } from "./TopForm";
import { FaMinus, FaPlus } from "react-icons/fa";
import { IconContext } from "react-icons";

const maxItems = 32;

function App() {
  const [requests, setRequests] = useState<Request[]>(
    new Array(maxItems).fill({
      area: 0,
      metric: "Public transport",
    })
  );
  const [areas, setAreas] = useState<Result>();
  const [itemsToCompare, setItemsToCompare] = useState<number>(1);
  const [yearBounds, setYearBounds] = useState<number[]>([0, 0]);
  const [chartData, setChartData] = useState<ExtractedData | undefined>();

  useEffect(() => {
    getAreas()
      .then((newAreas) => {
        setAreas(newAreas);
        defaultRequest(0);
      })
      .catch((err) => console.error(err));
  }, []);

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
        <div className="w-full flex flex-col">
          <div className="bg-sky-300 p-4 w-full flex flex-col md:flex-row-reverse justify-between items-center shadow-md">
            <div className="flex flex-col mb-4 md:mb-0">
              <p>Items to compare:</p>
              <div className="flex flex-row gap-2 mx-auto mt-2 items-center self-end">
                <button
                  disabled={itemsToCompare === 1}
                  onClick={() =>
                    setItemsToCompare((items) => {
                      const newItems = items - 1;

                      defaultRequest(items);

                      return newItems;
                    })
                  }
                >
                  <IconContext.Provider
                    value={{ size: "10", className: "fill-sky-800" }}
                  >
                    <FaMinus />
                  </IconContext.Provider>
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
                  <IconContext.Provider
                    value={{ size: "10", className: "fill-sky-800" }}
                  >
                    <FaPlus />
                  </IconContext.Provider>
                </button>
              </div>
            </div>
            <TopForm
              areas={areas}
              itemsToCompare={itemsToCompare}
              requests={requests}
              setRequests={setRequests}
              setChartData={setChartData}
              setYearBounds={setYearBounds}
            />
          </div>
        </div>
      )}
      {chartData && yearBounds ? (
        <ChartView chartData={chartData} yearBounds={yearBounds} />
      ) : (
        <div className="w-full h-full flex">
          <h3 className="m-auto text-2xl text-gray-400 p-4 text-center">Select areas and metrics to start comparing data.</h3>
        </div>
      )}
    </>
  );
}

export default App;

export type { ExtractedData };
