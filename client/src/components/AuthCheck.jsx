import Axios from "axios";

Axios.defaults.withCredentials = true;

export default async function AuthCheck() {
  try {
    const { data: response } = await Axios.get(
      "http://localhost:3001/isUserAuth",
      {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      }
    );
    return response;
  } catch (error) {
    console.log(error);
  }
}
