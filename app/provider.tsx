"use client";

import axios from "axios";
import { User } from "lucide-react";
import React, { useEffect } from "react";
import { UserDetailContext } from "../context/UserDetailContext";

const Provider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
 const [userDetail , setUserDetail] = React.useState();
  console.log("🔥 PROVIDER COMPONENT RENDERED");

  useEffect(() => {
    console.log("🔥 USE EFFECT RUNNING");

    const createNewUser = async () => {
      try {
        console.log("🔥 Calling /api/users...");

        const result = await axios.post("/api/users");

        console.log("🔥 API response:", result.data);
        setUserDetail(result.data.user);
      } catch (error) {
        console.error("🔥 API ERROR:", error);
      }
    };

    createNewUser();
  }, []);

  return (
    <div>
        <UserDetailContext.Provider value={{ userDetail, setUserDetail }}> {children} </UserDetailContext.Provider>
     
    </div>
  );
};

export default Provider;