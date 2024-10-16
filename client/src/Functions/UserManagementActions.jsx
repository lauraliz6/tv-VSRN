import Axios from "axios";

//SORTING
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
export function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

//FILTERING
export const filterUsers = (filters, users) => {
  const newUserArr = [];
  users.forEach((user) => {
    if (filters.indexOf(user.roles) > -1) {
      newUserArr.push(user);
    }
  });
  return newUserArr;
};

//WRITING TO DB
export async function writeUserChangesDb(updates) {
  return new Promise((resolve, reject) => {
    for (let u = 0; u < updates.length; u++) {
      const update = updates[u];
      Axios.post("http://localhost:3001/updateUserInfo", {
        changes: update,
      }).then((response) => {
        //on error
        if (response.data.err) {
          console.log(response.data.err);
          resolve({ success: false });
        } else if (response.data.success && u === updates.length - 1) {
          resolve({ success: true });
        }
      });
    }
  });
}

export function checkForNameChange(changesObjs) {
  const nameChanges = [];
  changesObjs.forEach((changeEl) => {
    const changeProps = changeEl.props;
    const findName = changeProps.find((e) => e.id === "nameUsers");
    if (findName) {
      const newName = { old: findName.initial, new: findName.new };
      nameChanges.push(newName);
    }
  });
  return nameChanges;
}

//TRACKING CHANGES
export function checkForChanges(changes) {
  const changesObjArr = [...changes];
  changes.forEach((userChange) => {
    const uid = userChange.userId;
    const props = userChange.props;
    props.forEach((prop) => {
      let valField = document.getElementById(uid + "-" + prop.id);
      const newVal = valField.value;
      //if the value has changed, update the new property
      if (newVal && newVal !== prop.initial) {
        prop.new = newVal;
      }
    });
  });
  const changesStrArr = [];
  changes.forEach((change) => {
    const changeUser = change.userId;
    const changeProps = change.props;
    changeProps.forEach((changeProp) => {
      const propName = changeProp.id;
      const oldVal = changeProp.initial;
      const newVal = changeProp.new;
      if (newVal) {
        let newStr = "Change ";
        newStr += propName + " from " + oldVal + " to " + newVal;
        newStr += " for user " + changeUser;
        changesStrArr.push(newStr);
      }
    });
  });
  return { obj: changesObjArr, str: changesStrArr };
}

export function findEditRows(rowList, editRows) {
  const editArr = [];
  rowList.forEach((item) => {
    if (editRows.indexOf(item.uidUsers) > -1) {
      item.edit = true;
    } else {
      item.edit = false;
    }
    editArr.push(item);
  });
  return editArr;
}

//FORMATTING
export const formatRates = (rate) => {
  if (rate === "0") {
    return "";
  } else {
    const rates = JSON.parse(rate);
    let string = "1-9: $" + rates["1-9"] + " per";
    string += " | ";
    string += "10+: $" + rates["10+"];
    if (rates["1-9"] !== rates["rush1-9"]) {
      string += " | ";
      string += "Rush 1-9: $" + rates["rush1-9"] + " per";
      string += " | ";
      string += "Rush 10+: $" + rates["rush10+"];
    }
    return string;
  }
};
