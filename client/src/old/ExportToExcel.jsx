import React from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import Button from "@material-ui/core/Button";

export const ExportToExcel = ({ apiData, fileName }) => {
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

  return (
    <Button
      size="large"
      color="primary"
      variant="contained"
      aria-label="large outlined primary button group"
      onClick={(e) => exportToCSV(apiData, fileName)}
    >
      Export
    </Button>
  );
};
