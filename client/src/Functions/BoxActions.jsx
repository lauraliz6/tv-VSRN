import Axios from "axios";

export function accessToken() {
  return new Promise((resolve) => {
    Axios.get("http://localhost:3001/boxaccess").then((response) => {
      resolve(response.data);
    });
  });
}

export async function boxProcess(scriptName, reqId, title, talent, script) {
  const token = await accessToken();
  if (token) {
    createInstance(token);
    if (scriptName === "") {
      return { success: false, error: "folder" };
    } else {
      try {
        const folder = await createFolder(reqId, title, talent, instance);
        if (folder.success) {
          const mainFoldId = folder.id;
          try {
            //not passing instance since it's already created in createFolder()
            const subFolders = await createSubFolders(folder.id);
            if (subFolders) {
              const scriptFolder = subFolders.id;
              try {
                const root = "https://[company].app.box.com/folder/";
                const writeDb = await writeFolderToDb(reqId, root + mainFoldId);
                if (writeDb) {
                  try {
                    const file = await upload(
                      scriptFolder,
                      scriptName,
                      script,
                      instance
                    );
                    if (file.success) {
                      return { success: true };
                    } else {
                      return {
                        success: false,
                        error: "upload",
                        folder: scriptFolder,
                      };
                    }
                  } catch (error) {
                    return {
                      success: false,
                      error: "upload",
                      folder: scriptFolder,
                    };
                  }
                }
              } catch (error) {
                return { success: false };
              }
            } else {
              return { success: false, error: "folder" };
            }
          } catch (error) {
            return { success: false, error: "folder" };
          }
        } else {
          return { success: false, error: "folder" };
        }
      } catch (error) {
        return { success: false, error: "folder" };
      }
    }
  }
}

let instance;

function createInstance(token) {
  instance = Axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
//
//HELLO IMPORTANT NOTE!!!!
//IMPORTANT!!!!!
//
//IMPORTANT!!!
//THIS WILL NEED TO BE FILLED WITH ACTUAL TALENT FOLDERS
const talentFolders = [
  { name: "Voice Talent", folder: 148418983995 },
  { name: "Second Voice", folder: 148419232507 },
  { name: "Third Voice", folder: 148418050126 },
];

const getTalentFolder = (talent) => {
  const tal = talentFolders.find((item) => item.name === talent);
  const talFold = tal.folder;
  return talFold;
};

function createFolder(reqId, title, talent, instance) {
  return new Promise((resolve, reject) => {
    const talFolder = getTalentFolder(talent);
    const folderName = reqId + " - " + title;

    const data = JSON.stringify({
      name: folderName,
      parent: { id: talFolder },
    });

    let uploadUrl = "https://api.box.com/2.0/folders";
    instance
      .post(uploadUrl, data)
      .then((res) => {
        if (res.status === 201) {
          resolve({ success: true, id: res.data.id });
        } else {
          resolve({ success: false });
        }
      })
      .catch((error) => {
        reject({ success: false });
      });
  });
}

function createSubFolders(parentId) {
  return new Promise((resolve, reject) => {
    try {
      createSubFolder(parentId, "Audio").then((response) => {
        if (response.success) {
          try {
            createSubFolder(parentId, "Scripts").then((response) => {
              if (response.success) {
                resolve({ success: true, id: response.id });
              }
            });
          } catch (error) {
            reject({ success: false });
          }
        }
      });
    } catch (error) {
      reject({ success: false });
    }
  });
}

function createSubFolder(parentId, type) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      name: type,
      parent: { id: parentId },
    });

    let uploadUrl = "https://api.box.com/2.0/folders";
    instance
      .post(uploadUrl, data)
      .then((res) => {
        if (res.status === 201) {
          resolve({ success: true, id: res.data.id });
        } else {
          resolve({ success: false });
        }
      })
      .catch((error) => {
        reject({ success: false });
      });
  });
}

function upload(folder, scriptName, script, instance) {
  return new Promise((resolve, reject) => {
    //from here: https://support.box.com/hc/en-us/community/posts/360049200573-Unable-to-upload-file-but-can-create-folder-and-list-content
    const attributes = JSON.stringify({
      name: scriptName.split("\\").pop(),
      parent: { id: folder },
      //blank for error testing
      // parent: { id: "" },
    });

    const formData = new FormData();
    formData.append("file", script);
    formData.append("attributes", attributes);

    let uploadUrl = "https://upload.box.com/api/2.0/files/content";
    instance
      .post(uploadUrl, formData)
      .then((res) => {
        if (res.status === 201) {
          resolve({ success: true });
        } else {
          resolve({ success: false });
        }
      })
      .catch((error) => {
        reject({ success: false });
      });
  });
  //get request for testing
  // instance.get("https://api.box.com/2.0/folders/147895479262").then((res) => {
  //   console.log(res);
  // });
}

export function writeFolderToDb(id, folder) {
  return new Promise((resolve, reject) => {
    Axios.post("http://localhost:3001/writeBoxFolder", {
      id: id,
      folder: folder,
    })
      .then((response) => {
        const success = response.data.success;
        if (success) {
          resolve(true);
        } else {
          reject(response.data.err);
        }
      })
      .catch((err) => reject(err));
  });
}
