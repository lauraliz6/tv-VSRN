import React from "react";
import axios from "axios";

import { ExportToExcel } from "../components/ExportToExcel";

function ExportXls() {
  const [data, setData] = React.useState([]);
  const fileName = "excelExport"; // here enter filename for your excel file

  React.useEffect(() => {
    const fetchData = () => {
      axios.get("http://localhost:3001/allData").then((r) => setData(r.data));
    };
    fetchData();
  }, []);

  return (
    <div>
      <ExportToExcel apiData={data} fileName={fileName} />
    </div>
  );
}

export default ExportXls;
