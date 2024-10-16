import React, { useState, useEffect, useContext } from "react";
import Axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
//using emotion for custom styling https://emotion.sh/docs/
import styled from "@emotion/styled";

import { UserContext } from "../AppAuth/Context.jsx";

import TimeOffDialog from "./TimeOffDialog.jsx";
import TimeOffRequestDlg from "./TimeOffRequestDlg.jsx";

import { LinearProgress } from "@material-ui/core";

export const StyleWrapper = styled.div`
  .fc {
    font-family: "Roboto Condensed", "sans-serif";
  }
  .fc .fc-button-primary {
    text-transform: uppercase;
    background-color: #33173d;
    border-color: #33173d;
  }
  .fc .fc-button-primary:hover {
    background-color: #8876de;
    border-color: #8876de;
  }

  .fc-day:hover {
    background-color: rgba(236, 224, 240, 0.5);
  }
  .fc .fc-daygrid-day.fc-day-today {
    background-color: #ece0f0;
  }
  .fc .fc-highlight {
    border: 2px #9e65b4 solid;
    background-color: #ffffff;
  }
`;

//colors from: http://web-accessibility.carnegiemuseums.org/design/color/
const talentColors = {
  McCoy: "212121",
  Baker: "323a45",
  Marquis: "112e51",
  Sellers: "0071bc",
  Schurko: "046b99",
  Shaw: "cd2026",
  Wojtas: "494440",
  Rankins: "5b616b",
  Hunter: "205493",
  Kramer: "4773aa",
  Cunningham: "2e8540",
  Voice: "981b1e",
  //duplicate of mccoy
  Talent: "212121",
};

export default function TimeOffCalendar() {
  const { user } = useContext(UserContext);
  const role = user.user.role;
  const usern = user.user.userName;
  const userfull = user.user.user;

  //dummy dates for testing
  // const [events, setEvents] = useState([
  //   { title: "event 1", date: "2021-12-01" },
  //   { title: "event 2", date: "2021-12-03" },
  // ]);

  const [timeOffDays, setTimeOffDays] = useState([]);
  const [dateRange, setDateRange] = useState();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({
    title: "",
    start: "",
    end: "",
    id: "",
    requested: "",
    comment: "",
  });

  const [loading, setLoading] = useState(false);

  const [addMode, setAddMode] = useState(false);
  const [reqOpen, setReqOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState({ start: "", end: "" });

  useEffect(() => {
    if (role === "vt") {
      setAddMode(true);
    } else {
      setAddMode(false);
    }
  }, [role]);

  useEffect(() => {
    const getTimeOffs = () => {
      setLoading(true);
      if (usern && dateRange) {
        Axios.get("http://localhost:3001/timeOff", {
          headers: {
            userType: role,
            userName: usern,
            start: dateRange.start,
            end: dateRange.end,
          },
        }).then((response) => {
          if (!response.data.err) {
            const daysArr = [];
            response.data.forEach((date) => {
              const lastName = date.talent.split(" ").pop();
              const color = "#" + talentColors[lastName];
              const start = date.start;
              let end = new Date(date.end);
              end.setHours(23);
              const day = {
                id: date.id,
                title: date.talent,
                start: start,
                end: end,
                extendedProps: {
                  requested: date.reqDate,
                  comment: date.comment,
                },
                backgroundColor: color,
                borderColor: color,
              };
              daysArr.push(day);
            });
            setTimeOffDays(daysArr);
            setLoading(false);
          }
        });
      }
    };
    getTimeOffs();
  }, [role, usern, dateRange, dialogOpen, reqOpen]);

  const handleEventClick = (clickInfo) => {
    const ev = clickInfo.event;
    setSelectedEvent({
      title: ev.title,
      start: ev.start.toISOString().split("T").shift(),
      end: ev.end.toISOString().split("T").shift(),
      id: ev.id,
      requested: ev.extendedProps.requested.split("T").shift(),
      comment: ev.extendedProps.comment,
    });
    setDialogOpen(true);
  };

  const dateSetFn = (info) => {
    const calStart = info.startStr;
    const calEnd = info.endStr;
    const dateObj = { start: calStart, end: calEnd };
    setDateRange(dateObj);
  };

  //this will only run for the VT
  const reqTimeOff = () => {
    setReqOpen(true);
  };
  //this will only run for the VT
  const handleDateSelect = (selectInfo) => {
    const endEdit = selectInfo.end;
    endEdit.setDate(endEdit.getDate() - 1);
    const endDate = endEdit.toISOString().split("T").shift();
    setSelectedDays({ start: selectInfo.startStr, end: endDate });
    setReqOpen(true);
  };

  return (
    <StyleWrapper>
      {loading && <LinearProgress />}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        events={timeOffDays}
        editable={false}
        selectable={addMode}
        displayEventTime={false}
        select={handleDateSelect}
        eventClick={handleEventClick}
        datesSet={(e) => {
          dateSetFn(e);
        }}
        viewDidMount={(e) => {
          dateSetFn(e);
        }}
        customButtons={{
          addModeButton: {
            text: "REQUEST TIME OFF",
            click: function () {
              reqTimeOff();
            },
          },
        }}
        headerToolbar={{
          left: "title",
          right: addMode
            ? "addModeButton dayGridMonth,listMonth today prev,next"
            : "dayGridMonth,listMonth today prev,next",
        }}
      />
      <TimeOffDialog
        open={dialogOpen}
        title={selectedEvent.title}
        id={selectedEvent.id}
        start={selectedEvent.start}
        end={selectedEvent.end}
        requested={selectedEvent.requested}
        comment={selectedEvent.comment}
        usertype={role}
        userfulln={userfull}
        passChildData={setDialogOpen}
      />
      <TimeOffRequestDlg
        open={reqOpen}
        passChildData={setReqOpen}
        range={selectedDays}
      />
    </StyleWrapper>
  );
}
