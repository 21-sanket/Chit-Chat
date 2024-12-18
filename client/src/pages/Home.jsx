import axios from "axios";
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout, setUser, setOnlineUser, setSocketConnection } from "../redux/userSlice";
import Sidebar from "../components/Sidebar";
import logo from './../assets/logo.png'
import io from 'socket.io-client';

const Home = () => {
  const user = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // console.log("user", user);

  const fetchUserDetails = async () => {
    try {
      const URL = `${import.meta.env.VITE_BACKEND_URL}/api/user-details`;
      const response = await axios({
        url: URL,
        withCredentials: true,
      });
      // console.log("response ", response);
      dispatch(setUser(response.data.data));

      if (response.data.data.logout) {
        dispatch(logout());
        navigate("/email");
      }

      // console.log("current user details ", response);
    } catch (err) {
      console.log("Error ", err);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // socket connection
  useEffect(() => {
    const socketConnection = io(import.meta.env.VITE_BACKEND_URL, {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    socketConnection.on("onlineUser", (data) => {
      // console.log(data);
      dispatch(setOnlineUser(data));
    });

    dispatch(setSocketConnection(socketConnection));

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  // console.log("location ", location);
  const basePath = location.pathname === "/";
  

  return (
    <div className="grid lg:grid-cols-[300px,1fr] h-screen max-h-screen">
      <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
        <Sidebar />
      </section>

      {/* message component */}
      <section className={`${basePath && "hidden"}`}>
        <Outlet />
      </section>

      <div
        className={`justify-center items-center flex-col gap-2 hidden ${
          !basePath ? "hidden" : "lg:flex"
        }`}
      >
        <div>
          <img src={logo} width={150} alt="logo" />
        </div>
        <p className="text-lg text-slate-500">
          Select user to send message
        </p>
      </div>
    </div>
  );
};

export default Home;