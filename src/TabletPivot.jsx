/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import ReactPivot from "react-pivot-webpack";
import "./App.css";

const TablePivot = ({
  activeDimensionss,
  dataUrl,
  dataForPercentage,
  titleRowCalculation,
  showExportButton,
}) => {
  const [data, setData] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [headers, setHeaders] = useState([]);
  const pivotRef = useRef(null);

  useEffect(() => {
    fetch(dataUrl)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        if (data.length > 0) {
          const keys = Object.keys(data[0]);
          const generatedDimensions = keys.map((key) => ({
            title: key,
            value: key,
          }));
          setDimensions(generatedDimensions);
        }
      });
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const exportBtn = pivotRef.current?.querySelector(
        ".reactPivot-csvExport button"
      );
      const thElements = pivotRef.current?.querySelectorAll(
        ".reactPivot-results table thead th"
      );

      if (exportBtn) {
        exportBtn.style.display = showExportButton ? "block" : "none";
      }

      if (thElements) {
        const thValues = Array.from(thElements)
          .slice(0, -2)
          .map((th) => th.textContent.trim());
        setHeaders(thValues);
      }
    });

    if (pivotRef.current) {
      observer.observe(pivotRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const tableRows = pivotRef.current?.querySelectorAll("tr");

    tableRows?.forEach((row) => {
      const tableCells = Array.from(row.querySelectorAll("td"));

      // Buscar celdas vacías o con texto "Total"
      const emptyCells = tableCells.filter((cell) => {
        const span = cell.querySelector("span");
        return (
          span &&
          (span.textContent.trim() === "" ||
            span.textContent.trim() === "Total")
        );
      });

      if (emptyCells.length > 0) {
        const firstCell = emptyCells[0];
        const colspan = emptyCells.length;

        // Configurar colspan y alinear el texto a la derecha
        firstCell.setAttribute("colspan", colspan);
        firstCell.style.textAlign = "end"; // Alineación a la derecha
        firstCell.querySelector("span").textContent = "Total";

        // Ocultar las celdas adicionales
        emptyCells.slice(1).forEach((cell) => {
          cell.style.display = "none"; // Ocultar celdas
        });
      }
    });
  }, [headers]);

  const reduce = (row, memo) => {
    memo[dataForPercentage] =
      (memo[dataForPercentage] || 0) + row[dataForPercentage];
    return memo;
  };

  function parseKey(key) {
    const items = orderArray(headers, key.split("ÿ"));
    const parsedObject = {};

    for (let i = 0; i < items.length - 3; i += 2) {
      parsedObject[items[i]] = items[i + 1];
    }

    return parsedObject;
  }

  function orderArray(array1, array2) {
    let result = [];
    for (let type of array1) {
      let index = array2.indexOf(type);
      if (index !== -1 && index + 1 < array2.length) {
        result.push(array2[index]);
        result.push(array2[index + 1]);
      }
    }
    return result;
  }

  function filterDataByKey(data, dimensions, _key) {
    const parsedKey = parseKey(_key);
    const dimensionMap = {};
    for (const valueD of dimensions) {
      dimensionMap[valueD.title] = valueD.value;
    }
    return data.filter((item) =>
      Object.entries(parsedKey).every(
        ([key, value]) => item[dimensionMap[key]] === value
      )
    );
  }

  const calculations = [
    {
      title: titleRowCalculation,
      value: titleRowCalculation.trim(),
      template: function (val, row) {
        return row[dataForPercentage];
      },
      className: "alignRight",
    },
    {
      title: "Porcentaje",
      value: "Porcentage",
      template: function (val, row) {
        let total = 0;
        let dataKey = filterDataByKey(data, dimensions, row._key);

        dataKey.forEach((value) => (total += value[dataForPercentage]));

        return total == 0
          ? "100%"
          : ((row[dataForPercentage] / total) * 100).toFixed(1) + " %";
      },
      className: "alignRight lastColumn",
    },
  ];

  return (
    <div className="card card-height-100">
      <div className="card-body p-2">
        <div className="w-100" ref={pivotRef}>
        <ReactPivot
            key={JSON.stringify(dimensions)}
            rows={data}
            dimensions={dimensions}
            reduce={reduce}
            calculations={calculations}
            activeDimensions={activeDimensionss}
            nPaginateRows={Infinity}
            subDimensionText={"Filtrar"}
            soloText={" seleccionar"}
          />
        </div>
      </div>
    </div>
  );
};

export default TablePivot;
