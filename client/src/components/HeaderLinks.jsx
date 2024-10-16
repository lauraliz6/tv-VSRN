import { ButtonGroup } from "@material-ui/core";

import { ExportExcel } from "../Functions/ExportXls";

import HelpIcon from "@material-ui/icons/Help";
import LockIcon from "@material-ui/icons/Lock";
import TableChartIcon from "@material-ui/icons/TableChart";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import PostAddIcon from "@material-ui/icons/PostAdd";
import GroupIcon from "@material-ui/icons/Group";

import HeaderBtn from "./HeaderBtn";

const HeaderLinks = (props) => {
  const user = props.user;
  const role = user.role;
  return (
    <ButtonGroup>
      {role === "admin" && (
        <HeaderBtn
          icon={<TableChartIcon />}
          text="Export XLS"
          onClick={(e) => {
            ExportExcel(e, role);
          }}
        />
      )}
      {role === "admin" && (
        <HeaderBtn icon={<GroupIcon />} text="Admin" link="/admindashboard" />
      )}
      {role !== "vt" && (
        <HeaderBtn
          icon={<PostAddIcon />}
          text="New Voice Request"
          link="/newRequest"
        />
      )}
      <HeaderBtn
        icon={<CalendarTodayIcon />}
        text="Time-Off Calendar"
        link="/timeoff"
      />
      <HeaderBtn icon={<LockIcon />} text="Change Password" link="/password" />
      <HeaderBtn icon={<HelpIcon />} text="Help" link="/help" />
    </ButtonGroup>
  );
};

export default HeaderLinks;
