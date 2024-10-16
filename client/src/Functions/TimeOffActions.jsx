import AuthCheck from "../components/AuthCheck";
import Axios from "axios";

export async function RemoveTimeOff(id, touser, user) {
  //first check to make sure user has permission (removing request for themselves)
  if (touser === user) {
    //second check is the auth token check
    const auth = await AuthCheck();
    if (auth.auth === true) {
      //now Axios sends to the backend to update the status of the request to 'canceled'
      const removeDates = await Axios.post(
        "http://localhost:3001/removeTimeOff",
        {
          id: id,
        }
      ).then((response) => {
        const success = response.data.success;
        if (success) {
          return true;
        } else {
          return false;
        }
      });
      if (removeDates) {
        return { success: true };
      } else {
        //if status cannot be updated, return error
        return { success: false, err: "Database connection error." };
      }
    } else {
      //if user auth token fails, return error
      return { success: false, err: "Authorization failed." };
    }
  }
  //if the user is a voice talent (not authorized to cancel), return error
  else return { success: false, err: "Permission denied." };
}

export async function RequestTimeOff(uid, start, end, comment) {
  //first check is the auth token check
  const auth = await AuthCheck();
  if (auth.auth === true) {
    //now Axios sends to the backend to check for any date overlap
    const addDates = await Axios.post("http://localhost:3001/addTimeOff", {
      uid: uid,
      start: start,
      end: end,
      comment: comment,
    }).then((response) => {
      if (response.data.success) {
        return { success: true };
      } else {
        return { success: false, err: response.data.err };
      }
    });
    if (addDates.success) {
      return { success: true };
    } else {
      return { success: false, err: addDates.err };
    }
  } else {
    //if user auth token fails, return error
    return { success: false, err: "Authorization failed." };
  }
}
