import axios from "axios";
import sha1 from "sha1";
import { useState, useEffect } from "react";
import "./App.css";

const BASE_URL = "http://api.pixlpark.com/";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

const authApi = {
  requestToken: "oauth/requesttoken",
  acessToken: "oauth/accesstoken",
  order: "orders",
};

const PUBLIC_KEY = "38cd79b5f2b2486d86f562e3c43034f8";
const PRIVATE_KEY = "8e49ff607b1f46e1a5e8f6ad5d312a80";

function App() {
  const [order, setOrder] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setFetching(true);
      try {
        const requestTokenResponse = await axiosInstance(authApi.requestToken);
        const requestToken = requestTokenResponse.data.RequestToken;

        const password = sha1(`${requestToken}${PRIVATE_KEY}`);
        const acessTokenResponse = await axiosInstance(authApi.acessToken, {
          params: {
            oauth_token: requestToken,
            grant_type: "api",
            username: PUBLIC_KEY,
            password: password,
          },
        });
        const acessToken = acessTokenResponse.data.AccessToken;

        const orderResponse = await axiosInstance(authApi.order, {
          params: {
            oauth_token: acessToken,
          },
        });
        const order = orderResponse.data.Result;
        setOrder(order);
      } catch (error) {
        console.log(error.data);
      }
      setFetching(false);
    }
    fetchData();
  }, [setFetching]);

  return (
    <div className="App">
      {fetching ? (
        <h2>Fetching</h2>
      ) : (
        <ul className="orders-list">
          {order.map(
            ({ Title, PreviewImageUrl, Description, Id, Status, Price }) => (
              <li key={Id} className="orders-list__item">
                <h3>{Title}</h3>
                <img
                  src={PreviewImageUrl}
                  alt="order item"
                  width={300}
                  height={200}
                />
                <p>status: {Status}</p>
                <p>{Description}</p>
                <p>Price: {Price}р</p>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}

export default App;
