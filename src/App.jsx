import "./App.css";
import TablePivot from "./TabletPivot";

function App() {
  return (
    <>
      <TablePivot
        title={"Pivot table"}
        dataUrl={"/data.json"}
        activeDimensionss={["Country", "Category", "Destination"]}
        dataForPercentage={"Quantity"}
        titleRowCalculation={"Cantidad"}
        showExportButton={false}
      ></TablePivot>
    </>
  )
}

export default App

