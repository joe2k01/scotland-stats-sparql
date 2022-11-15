import { useEffect, useState } from "react";
import { getAreas, Result } from "./queryHelper";

function App() {
  const [data, setData] = useState("");
  const [areas, setAreas] = useState<Result>();

  useEffect(() => {
    getAreas()
      .then((newAreas) => setAreas(newAreas))
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      {areas && (
        <div className="w-full h-full flex flex-col">
          <div className="bg-sky-300 p-4 w-full flex-row">
            <select>
              {Object.keys(areas.results.bindings).map((areaIndex) => (
                <option key={`area-${areaIndex}`}>
                  {areas.results.bindings[parseInt(areaIndex)].areaname.value}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
