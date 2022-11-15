import { useEffect, useState } from "react";
import ChartView from "./ChartView";
import { getAreas, Result } from "./queryHelper";
import TopForm, { ExtractedData, Request } from "./TopForm";

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
        <div className="w-full h-full flex flex-col">
          <div className="bg-sky-300 p-4 w-full flex flex-row justify-between items-center">
            <TopForm
              areas={areas}
              itemsToCompare={itemsToCompare}
              requests={requests}
              setRequests={setRequests}
              setChartData={setChartData}
            />
            <div className="flex flex-col">
              <p>Items to compare:</p>
              <div className="flex flex-row">
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
