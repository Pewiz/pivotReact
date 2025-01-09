import { useState, useEffect, useRef } from "react";
import ReactPivot from "react-pivot-webpack";

const PivotTable = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const pivotRef = useRef(null);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => setData(data.data));
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const thElements = pivotRef.current?.querySelectorAll(
        ".reactPivot-results table thead th"
      );
      if (thElements) {
        const thValues = Array.from(thElements)
          .slice(0, -3)
          .map((th) => th.textContent.trim());
        setHeaders(thValues);
      }
    });

    if (pivotRef.current) {
      observer.observe(pivotRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, []);

  const dimensions = [
    { title: "Pais", value: "Country" },
    { title: "Tipo Negocio", value: "Business Type" },
    { title: "Categoria", value: "Category" },
    { title: "Tamaño", value: "Size" },
  ];

  const reduce = (row, memo) => {
    memo.Quantity = (memo.Quantity || 0) + row.Quantity;
    memo.Price = (memo.Price || 0) + row.Price;
    return memo;
  };

  function parseKeyToObject(key) {
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
    const parsedKey = parseKeyToObject(_key);
    console.log("ParsedKey: ", parsedKey);
    return data.filter((item) => {
      return Object.entries(parsedKey).every(([key, value]) => {
        const dimension = dimensions.find((d) => d.title === key);
        return dimension && item[dimension.value] === value;
      });
    });
  }

  const calculations = [
    {
      title: "Cantidad",
      value: "Quantity",
    },
    {
      title: "Porcentaje 1",
      value: "Percentage",
      template: function (val, row) {
        let total = 0;
        let dataKey = filterDataByKey(data, dimensions, row._key);
        dataKey.forEach((value) => (total += value.Quantity));
        console.log("DataKey", dataKey);
        return ((row.Quantity / total) * 100).toFixed(1);
      },
    },
    {
      title: "Porcentaje Total",
      value: "Percentageee",
      template: function (val, row) {
        let total = 0;
        data.forEach((value) => (total += value.Quantity));

        return ((row.Quantity / total) * 100).toFixed(1);
      },
    },
  ];

  return (
    <div className="card card-height-100">
      <div className="card-body p-2">
        <div className="w-100" ref={pivotRef}>
          <ReactPivot
            rows={data}
            dimensions={dimensions}
            reduce={reduce}
            calculations={calculations}
            activeDimensions={["Pais", "Tipo Negocio", "Categoria"]}
            nPaginateRows={250}
            subDimensionText={"Sub"}
          />
        </div>
      </div>
    </div>
  );
};

export default PivotTable;
