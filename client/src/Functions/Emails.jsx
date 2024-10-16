import Axios from "axios";

export function SendEmail(to, subject, message, reqId, extra) {
  return new Promise((resolve) => {
    let toEmail = to;
    Axios.post("http://localhost:3001/email", {
      email: toEmail,
      subject: subject,
      message: message,
      id: reqId,
      extra: extra,
    })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => resolve({ success: false, err: err }));
  });
}

export function SendSecurityEmail(to, subject, message) {
  return new Promise((resolve) => {
    let toEmail = to;
    Axios.post("http://localhost:3001/securityEmail", {
      email: toEmail,
      subject: subject,
      message: message,
    })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        resolve({ success: false, err: err });
      });
  });
}

export function FetchEmailAddress(role, reqId) {
  return new Promise((resolve) => {
    Axios.get("http://localhost:3001/emailAddress", {
      headers: {
        role: role,
        id: reqId,
      },
    })
      .then((response) => {
        if (response.data.err) {
          resolve({ success: false, err: response.data.err });
        } else {
          resolve({ success: true, info: response });
        }
      })
      .catch((err) => resolve({ success: false, err: err }));
  });
}

export function EmailProcess(role, reqId, subj, msg, extra) {
  return new Promise((resolve) => {
    //transforming "role" to an array if it's a singular var,
    //in order to allow function to send to multiple email addresses
    if (!Array.isArray(role)) {
      role = [].concat(role);
    }
    role.forEach((indiv) => {
      FetchEmailAddress(indiv, reqId).then((response) => {
        if (response.success) {
          let sendTo = response.info.data[0].emailUsers;
          // email reminder
          let emailSubj = subj;
          let emailMsg = msg;
          SendEmail(sendTo, emailSubj, emailMsg, reqId, extra).then(
            (response) => {
              if (response.data) {
                if (response.data.status === "success") {
                  resolve({ success: true });
                } else if (response.data.status === "error") {
                  resolve({ success: false, err: "Unable to send email." });
                }
              } else {
                resolve({ success: false, err: "Unable to send email." });
              }
            }
          );
        } else {
          resolve({ success: false, err: "Unable to fetch email address" });
        }
      });
    });
    //fetch email address
  });
}

//EMAILS FOR INDIVIDUAL ACTIONS

//REMINDER
export function ReminderEmail(id) {
  return new Promise((resolve) => {
    let role = "talent";
    let emailSubj = "Reminder from VoiSpark";
    let emailMsg = "You have been sent a reminder about a request on VoiSpark.";
    EmailProcess(role, id, emailSubj, emailMsg).then((response, err) => {
      if (response.success) {
        resolve(response);
      } else {
        resolve({ success: false, err: err });
      }
    });
  });
}

//NEW VOICE REQUEST
export function NewRequestEmail(id, info) {
  return new Promise((resolve) => {
    let role = "talent";
    let emailSubj = "New Request from VoiSpark";
    let emailMsg = "You have a new voice request.";
    let msgExtra = [
      { title: "Job Description", data: info.jobDescription },
      { title: "Title", data: info.videoTitle },
      { title: "Number of Chapters/Modules", data: info.chaptersModules },
      { title: "Due Date", data: info.dueDate + " Pacific Time" },
      { title: "Rate", data: "$" + info.rate },
    ];
    EmailProcess(role, id, emailSubj, emailMsg, msgExtra).then(
      (response, err) => {
        if (response.success) {
          resolve(response);
        } else {
          resolve({ success: false, err: err });
        }
      }
    );
  });
}

//USER COMMENT - NOT A CORRECTION
export function CommentEmail(id, comment, fromUserRole) {
  return new Promise((resolve) => {
    let role;
    fromUserRole === "vt" ? (role = "writer") : (role = "talent");
    let emailSubj = "Comment from VoiSpark";
    let emailMsg =
      "There's a new comment on a voice request you're assigned to.";
    let msgExtra = [{ title: "Comment", data: comment }];
    EmailProcess(role, id, emailSubj, emailMsg, msgExtra).then(
      (response, err) => {
        if (response.success) {
          resolve(response);
        } else {
          resolve({ success: false, err: err });
        }
      }
    );
  });
}

//CORRECTION
export function CorrectionEmail(id, comment) {
  return new Promise((resolve) => {
    let role = "talent";
    let emailSubj = "New Correction from VoiSpark";
    let emailMsg =
      "There's a new correction on a voice request you're assigned to.";
    let msgExtra = [{ title: "Correction comment", data: comment }];
    EmailProcess(role, id, emailSubj, emailMsg, msgExtra).then(
      (response, err) => {
        if (response.success) {
          resolve(response);
        } else {
          resolve({ success: false, err: err });
        }
      }
    );
  });
}

//CANCELLATION
export function CancelEmail(id, actor) {
  return new Promise((resolve) => {
    let role = "talent";
    if (actor === "admin") {
      //if admin is cancelling the job, send an alert to the writer assigned as well
      role = ["talent", "writer"];
    }
    let emailSubj = "Cancellation alert from VoiSpark";
    let emailMsg = "A voice request you are assigned to has been cancelled.";
    EmailProcess(role, id, emailSubj, emailMsg).then((response, err) => {
      if (response.success) {
        resolve(response);
      } else {
        resolve({ success: false, err: err });
      }
    });
  });
}

//CHANGE DETAILS
export function ChangeDetailsEmail(id) {
  return new Promise((resolve) => {
    let role = "talent";
    let emailSubj = "Voice Request Detail Change";
    let emailMsg = "You have a detail change in VoiSpark.";
    EmailProcess(role, id, emailSubj, emailMsg).then((response, err) => {
      if (response.success) {
        resolve(response);
      } else {
        resolve({ success: false, err: err });
      }
    });
  });
}

//VT STATUS CHANGE
export function VtStatusEmail(id, user, change) {
  return new Promise((resolve) => {
    let role = "writer";
    let emailSubj;
    let emailMsg;
    if (change === "reject") {
      emailSubj = `${user} has rejected a voice request in VoiSpark.`;
      emailMsg = "Voice request has been rejected.";
    } else if (change === "accept") {
      emailSubj = `${user} has accepted a voice request in VoiSpark.`;
      emailMsg = "Voice request has been accepted.";
    } else if (change === "audio") {
      emailSubj = `${user} has uploaded audio in VoiSpark.`;
      emailMsg = "Audio is up for your request in VoiSpark.";
    } else {
      resolve({ success: false, err: "Status error." });
    }
    EmailProcess(role, id, emailSubj, emailMsg).then((response, err) => {
      if (response.success) {
        resolve(response);
      } else {
        resolve({ success: false, err: err });
      }
    });
  });
}
