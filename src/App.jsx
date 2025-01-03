import React, { useState, useEffect } from "react";
import ReactPivot from "react-pivot-webpack"; 
import './App.css';

function App() {
  const [data, setData] = useState([]); 

  useEffect(() => {
    
    fetch("/data.json") 
      .then(res => res.json()) 
      .then(data => setData(data.data));
  }, []);


  const dimensions = [
    {  title: "Pais", value: "Country" }, 
    {  title: "Tipo Negocio", value: "Business Type" }, 
    {  title: "Categoria", value: "Category" },
  ];
  
  const reduce = (row, memo) => {
    memo.Price = (memo.Price || 0) + row.Price;
    return memo;
  };

  
  const calculations = [
    {
      title: "Precio Total", value: "Price", 
      template: function(val){
        return '$' + val
      },
    },
  ];

  return (
    <main>
      <ReactPivot
        rows={data}
        dimensions={dimensions} 
        reduce={reduce} 
        calculations={calculations} 
        activeDimensions={["Pais"]} 
      />
    </main>
  );
}

export default App;
