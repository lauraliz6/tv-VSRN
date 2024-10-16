import React from "react";

import { Button } from "@material-ui/core";
import WorkfrontSearch from "../components/WorkfrontSearch";
import { WorkfrontPost } from "../Functions/Actions";

export default function WfTest() {
  const fakeHandler = () => {
    console.log("hi");
  };

  const makeWfPost = () => {
    const info = {
      wfID: "[test id]",
      customer: "Practice Project",
      videoTitle:
        "Practice Project - Video",
      dueDate: "11-20-2021",
      talent: "Voice Talent",
      jobDescription: "",
      scriptType: "1-9",
      chaptersModules: "8",
      reviewCycle: "VD2",
      rate: "$80",
      rush: "n",
      boxLink: "http://www.box.com/",
    };
    const vs4Id = 400;
    WorkfrontPost(info, vs4Id).then((response) => {
      console.log(response);
    });
  };

  return (
    <div>
      <h1>WF Test Page</h1>
      <WorkfrontSearch
        passChildData={fakeHandler}
        id={{ data: false, id: "" }}
      />
      <div>
        <h2>WF Post Test</h2>
        <Button variant="contained" color="primary" onClick={makeWfPost}>
          make wf post
        </Button>
      </div>
    </div>
  );
}
