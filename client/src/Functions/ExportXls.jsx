import Axios from "axios";
import AuthCheck from "../components/AuthCheck";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

export function ExportExcel(e, role) {
  e.preventDefault();

  const fileName = "excelExport"; // here enter filename for your excel file
  const fetchData = () => {
    Axios.get("http://localhost:3001/allData").then((r) => {
      exportToCSV(r.data, fileName);
    });
  };

  if (role === "admin") {
    AuthCheck().then(function (authResult) {
      const auth = authResult.auth;
      if (auth) {
        fetchData();
      } else {
        console.log("Auth denied.");
      }
    });
  } else {
    console.log("Permission denied");
  }

  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";

  const exportToCSV = (apiData, fileName) => {
    const ws = XLSX.utils.json_to_sheet(apiData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };
}
