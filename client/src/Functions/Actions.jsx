import AuthCheck from "../components/AuthCheck";
import Axios from "axios";
import { confirm } from "../components/ConfirmDialog";
import { correct } from "../components/CorrectionsDialog";
import {
  ReminderEmail,
  NewRequestEmail,
  CommentEmail,
  CorrectionEmail,
  CancelEmail,
  VtStatusEmail,
} from "./Emails";

function convertDate(date) {
  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString();
  if (month.length < 2) {
    month = "0" + month;
  }
  let day = date.getDate().toString();
  if (day.length < 2) {
    day = "0" + day;
  }
  let hours = date.getHours().toString();
  if (hours.length < 2) {
    hours = "0" + hours;
  }
  let minutes = date.getMinutes().toString();
  if (minutes.length < 2) {
    minutes = "0" + minutes;
  }
  let seconds = date.getSeconds().toString();
  if (seconds.length < 2) {
    seconds = "0" + seconds;
  }
  const dateTime =
    year +
    "-" +
    month +
    "-" +
    day +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;
  return dateTime;
}

export function SubmitNewRequest(reqInfo, user) {
  const date = convertDate(new Date());
  return new Promise((resolve) => {
    if (user.role !== "vt") {
      AuthCheck().then(function (authResult) {
        const auth = authResult.auth;
        if (auth) {
          Axios.post("http://localhost:3001/newRequest", {
            info: reqInfo,
            user: user.user,
            date: date,
          })
            .then((response) => {
              const status = JSON.parse(response.request.response);
              if (status.err) {
                console.log(status.err);
                resolve({ err: "Error in writing to database" });
              } else if (status.insertId) {
                NewRequestEmail(status.insertId, reqInfo).then((response) => {
                  if (response.success) {
                    WorkfrontPost(reqInfo, status.insertId)
                      .then((response) => {
                        if (response.success) {
                          resolve({ success: true, id: status.insertId });
                        } else {
                          resolve({
                            success: false,
                            err: `Request logged in database, error posting to Workfront. Navigate to http://localhost:3000/request/${status.insertId} to see the request page.`,
                          });
                        }
                      })
                      .catch(() => {
                        resolve({
                          success: false,
                          err: `Request logged in database, error posting to Workfront. Navigate to http://localhost:3000/request/${status.insertId} to see the request page.`,
                        });
                      });
                  } else {
                    resolve({
                      success: false,
                      err: `Request logged in database, error sending email to voice talent. Navigate to http://localhost:3000/request/${status.insertId} to see the request page.`,
                    });
                  }
                });
              } else {
                resolve({ err: "Error in writing to database" });
              }
            })
            .catch((err) => resolve({ err: err }));
        } else {
          resolve({ err: "Authorization denied" });
        }
      });
    } else {
      resolve({ err: "Permission denied." });
    }
  });
}

export function WorkfrontPost(info, vs4Id) {
  return new Promise((resolve, reject) => {
    const wfId = info.wfID;
    const reqId = vs4Id;
    const numModules = info.chaptersModules;
    const talent = info.talent;
    //WILL NEED TO BE CHANGED TO HOST NAME
    const vsUrl = `http://localhost:3000/request/${reqId}`;
    const note = `Voice request ID #${reqId} for ${numModules} module(s) sent to ${talent}. \nVS4 URL: ${vsUrl}`;
    Axios.post("http://localhost:3001/wfpost", {
      id: wfId,
      //escape() lets us put the : and #
      note: escape(note),
    }).then((response) => {
      if (response.data.success) {
        resolve({ success: true });
      } else {
        reject({ success: false });
      }
    });
  });
}

//this function can be used over and over to post comments
//pass in the id of the request, the user, and "info" which is the comment
//e.g. info from Reminder is " sent a reminder to the voice talent."
export function SystemComment(id, user, info) {
  return new Promise((resolve) => {
    AuthCheck().then(function (authResult) {
      const comment = user + info;
      const system = "SYSTEM";
      const date = convertDate(new Date());
      const string = "/p: " + system + " d: " + date + " c: " + comment;
      const auth = authResult.auth;
      if (auth) {
        Axios.post("http://localhost:3001/comment", {
          id: id,
          comment: string,
        })
          .then((response) => {
            const success = response.data.success;
            if (success) {
              resolve({ success: true });
            } else {
              resolve({ success: false });
            }
          })
          .catch((err) => console.log(err));
      } else {
        resolve({ success: false });
      }
    });
  });
}

export function UserComment(id, user, comm, role) {
  return new Promise((resolve) => {
    AuthCheck().then(function (authResult) {
      const date = convertDate(new Date());
      const string = "/p: " + user + " d: " + date + " c: " + comm;
      const auth = authResult.auth;
      if (auth) {
        Axios.post("http://localhost:3001/comment", {
          id: id,
          comment: string,
        })
          .then((response) => {
            const success = response.data.success;
            if (success) {
              //if "correct" is entered as the role, this is a correction + email should be skipped here
              if (role === "correct") {
                //this allows skipping the email
                resolve({ success: true });
              } else {
                CommentEmail(id, comm, role).then((response) => {
                  if (response.success) {
                    resolve({ success: true });
                  } else {
                    resolve({ success: false });
                  }
                });
              }
            } else {
              resolve({ success: false });
            }
          })
          .catch((err) => console.log(err));
      } else {
        resolve({ success: false });
      }
    });
  });
}

export async function Reminder(id, user) {
  return new Promise((resolve) => {
    ReminderEmail(id).then((response) => {
      if (response.success) {
        //system comment of reminder sent
        const info = " sent a reminder to the voice talent.";
        SystemComment(id, user, info).then((response) => {
          if (response.success) {
            resolve({ success: true });
          } else {
            resolve({
              success: false,
              err: "Unable to post comment indicating reminder sent.",
            });
          }
        });
      } else {
        resolve({ success: false, err: "Unable to send email." });
      }
    });
  }).catch((err) => console.log(err));
}

export async function Corrections(id, role, user) {
  if (role !== "vt") {
    const auth = await AuthCheck();
    if (auth.auth === true) {
      const corr = await correct();
      if (corr.continue) {
        //now we change the status
        const resetStatus = await Axios.post("http://localhost:3001/status", {
          id: id,
          status: "sent",
        }).then((response) => {
          const success = response.data.success;
          if (success) {
            return true;
          } else {
            return false;
          }
        });
        //then post the comment
        if (resetStatus) {
          //if status update was successful (returned true) - then add a comment
          const info = "CORRECTION: " + corr.comment;
          const comment = await UserComment(id, user, info, "correct").then(
            (response) => {
              if (response.success) {
                return true;
              } else {
                return false;
              }
            }
          );
          if (comment) {
            //send email alert
            const email = await CorrectionEmail(id, corr.comment).then(
              (response) => {
                if (response.success) {
                  return true;
                } else {
                  return false;
                }
              }
            );
            if (email) {
              return { success: true };
            }
          } else {
            //if comment post fails, return that error
            return { success: false, err: "Unable to post comment." };
          }
        } else {
          return { success: false, err: "Unable to initiate correction." };
        }
        //then send the email
      } else {
        //this is the user canceling the correction
        return { success: false };
      }
    } else {
      return { success: false, err: "Authorization failed." };
    }
  } else return { success: false, err: "Permission denied." };
}

export async function Cancel(id, role, user) {
  //first check to make sure user has permission (is a writer or admin)
  if (role !== "vt") {
    //second check is the auth token check
    const auth = await AuthCheck();
    if (auth.auth === true) {
      //now Axios sends to the backend to update the status of the request to 'canceled'
      const statusUpdate = await Axios.post("http://localhost:3001/status", {
        id: id,
        status: "canceled",
      }).then((response) => {
        const success = response.data.success;
        if (success) {
          return true;
        } else {
          return false;
        }
      });
      if (statusUpdate) {
        //if status update was successful (returned true) - then add a comment
        const info = " canceled the job.";
        const comment = await SystemComment(id, user, info).then((response) => {
          if (response.success) {
            return true;
          } else {
            return false;
          }
        });
        if (comment) {
          //send email alert
          const cancel = await CancelEmail(id, role).then((response) => {
            if (response.success) {
              return true;
            } else {
              return false;
            }
          });
          if (cancel) {
            return { success: true };
          } else {
            return {
              success: false,
              err: "Job was cancelled, but email alert failed.",
            };
          }
        } else {
          //if comment post fails, return that error
          return { success: false, err: "Unable to post comment." };
        }
      } else {
        //if status cannot be updated, return error
        return { success: false, err: "Database connection error." };
      }
    } else {
      //if user auth token fails, return error
      return { success: false, err: "Authorization failed." };
    }
    //if the user is a voice talent (not authorized to cancel), return error
  } else return { success: false, err: "Permission denied." };
}

export async function MarkComplete(id, role, user) {
  if (role !== "vt") {
    const statusChange = await Axios.post("http://localhost:3001/status", {
      id: id,
      status: "complete",
    }).then((response) => {
      const success = response.data.success;
      if (success) {
        return true;
      } else {
        return false;
      }
    });
    if (statusChange) {
      //if status update was successful (returned true) - then add a comment
      const info = " job is complete";
      const comment = await SystemComment(id, user, info).then((response) => {
        if (response.success) {
          return true;
        } else {
          return false;
        }
      });
      if (comment) {
        return { success: true };
      } else {
        //if comment post fails, return that error
        return { success: false, err: "Unable to post comment." };
      }
    }
  }
}

export async function RequestNewRate(id, role, user) {
  //first check to make sure user has permission (is a writer or admin)
  if (role !== "vt") {
    //second check is a confirmation dialog
    if (
      await confirm(
        `Are you sure you want to request a new rate for request #${id}? This action will cancel request #${id} and create a new request.`
      )
    ) {
      //third check is the auth token check
      const auth = await AuthCheck();
      if (auth.auth === true) {
        //now Axios sends to the backend to update the status of the request to 'canceled'
        const statusUpdate = await Axios.post("http://localhost:3001/status", {
          id: id,
          status: "canceled",
        }).then((response) => {
          const success = response.data.success;
          if (success) {
            return true;
          } else {
            return false;
          }
        });
        if (statusUpdate) {
          //if status update was successful (returned true) - then add a comment
          const info = " canceled the job to request a new rate.";
          const comment = await SystemComment(id, user, info).then(
            (response) => {
              if (response.success) {
                return true;
              } else {
                return false;
              }
            }
          );
          if (comment) {
            const cancelEmail = await CancelEmail(id, role).then((response) => {
              if (response.success) {
                return true;
              } else {
                return false;
              }
            });
            if (cancelEmail) {
              return { success: true };
            } else {
              return {
                success: false,
                err: "Job was cancelled, but email alert failed.",
              };
            }
          } else {
            //if comment post fails, return that error
            return { success: false, err: "Unable to post comment." };
          }
        } else {
          //if status cannot be updated, return error
          return { success: false, err: "Database connection error." };
        }
      } else {
        //if user auth token fails, return error
        return { success: false, err: "Authorization failed." };
      }
    } else {
      //if the person says NO to the confirmation dialog, return false to stop the action
      return { success: false };
    }
    //if the user is a voice talent (not authorized to cancel), return error
  } else return { success: false, err: "Permission denied." };
}

//VT Actions

//Rejected
export async function Reject(id, role, user) {
  //first check to make sure user has permission (is a writer or admin)
  if (role !== "writer" || "admin") {
    //second check is the auth token check
    const auth = await AuthCheck();
    if (auth.auth === true) {
      //now Axios sends to the backend to update the status of the request to 'canceled'
      const statusUpdate = await Axios.post("http://localhost:3001/status", {
        id: id,
        status: "rejected",
      }).then((response) => {
        const success = response.data.success;
        if (success) {
          return true;
        } else {
          return false;
        }
      });
      if (statusUpdate) {
        //if status update was successful (returned true) - then add a comment
        const info = " rejected the job.";
        const comment = await SystemComment(id, user, info).then((response) => {
          if (response.success) {
            return true;
          } else {
            return false;
          }
        });
        if (comment) {
          const rejectEmail = await VtStatusEmail(id, user, "reject").then(
            (response) => {
              if (response.success) {
                return true;
              } else {
                return false;
              }
            }
          );
          if (rejectEmail) {
            return { success: true };
          } else {
            return {
              success: false,
              err: "Job was rejected, but email alert failed.",
            };
          }
        } else {
          //if comment post fails, return that error
          return { success: false, err: "Unable to post comment." };
        }
      } else {
        //if status cannot be updated, return error
        return { success: false, err: "Database connection error." };
      }
    } else {
      //if user auth token fails, return error
      return { success: false, err: "Authorization failed." };
    }
    //if the user is a voice talent (not authorized to cancel), return error
  } else return { success: false, err: "Permission denied." };
}

//Accepted
export async function Accept(id, role, user) {
  if (role !== "writer" || "admin") {
    const statusChange = await Axios.post("http://localhost:3001/status", {
      id: id,
      status: "progress",
    }).then((response) => {
      const success = response.data.success;
      if (success) {
        return true;
      } else {
        return false;
      }
    });
    if (statusChange) {
      //if status update was successful (returned true) - then add a comment
      const info = " accepted the job.";
      const comment = await SystemComment(id, user, info).then((response) => {
        if (response.success) {
          return true;
        } else {
          return false;
        }
      });
      if (comment) {
        const acceptEmail = await VtStatusEmail(id, user, "accept").then(
          (response) => {
            if (response.success) {
              return true;
            } else {
              return false;
            }
          }
        );
        if (acceptEmail) {
          return { success: true };
        } else {
          return {
            success: false,
            err: "Job was accepted, but email alert failed.",
          };
        }
      } else {
        //if comment post fails, return that error
        return { success: false, err: "Unable to post comment." };
      }
    }
  }
}

//Audio Up
export async function MarkAudioUp(id, role, user) {
  if (role !== "writer" || "admin") {
    const statusChange = await Axios.post("http://localhost:3001/status", {
      id: id,
      status: "audioUp",
    }).then((response) => {
      const success = response.data.success;
      if (success) {
        return true;
      } else {
        return false;
      }
    });
    if (statusChange) {
      //if status update was successful (returned true) - then add a comment
      const info = " uploaded the audio files.";
      const comment = await SystemComment(id, user, info).then((response) => {
        if (response.success) {
          return true;
        } else {
          return false;
        }
      });
      if (comment) {
        const acceptEmail = await VtStatusEmail(id, user, "audio").then(
          (response) => {
            if (response.success) {
              return true;
            } else {
              return false;
            }
          }
        );
        if (acceptEmail) {
          return { success: true };
        } else {
          return {
            success: false,
            err: "Job marked as Audio Uploaded, but email alert failed.",
          };
        }
      } else {
        //if comment post fails, return that error
        return { success: false, err: "Unable to post comment." };
      }
    }
  }
}
