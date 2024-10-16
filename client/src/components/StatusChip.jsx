import React from "react";

import { Chip } from "@material-ui/core";

//statuses are complete, sent, rejected, progress, canceled, change, audioUp

export default function StatusChip(props) {
  const statusTranslate = {
    complete: { label: "Complete", color: "#000000" },
    sent: { label: "Request Sent", color: "#004D4E" },
    rejected: { label: "Request Rejected", color: "#B46B03" },
    progress: { label: "In Progress", color: "#426024" },
    canceled: { label: "Canceled", color: "#833409" },
    change: { label: "Change Requested", color: "#5A5A5A" },
    audioup: { label: "Audio Files Uploaded", color: "#9E65B4" },
    incomplete: { label: "Incomplete", color: "#BF4300" },
  };

  const translateStatus = (status) => {
    const findStatus = status.toLowerCase();
    let translate = statusTranslate[findStatus];
    if (translate) {
      translate = translate.label;
    } else {
      translate = "Unknown";
    }
    return translate;
  };

  const colorStatus = (status) => {
    const findStatus = status.toLowerCase();
    let color = statusTranslate[findStatus];
    if (color) {
      color = color.color;
    } else {
      color = "#CC00CC";
    }
    return color;
  };

  return (
    <Chip
      label={translateStatus(props.label)}
      variant="outlined"
      style={{
        color: colorStatus(props.label),
        borderColor: colorStatus(props.label),
      }}
    ></Chip>
  );
}
