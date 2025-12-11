import { createContext, useEffect, useState } from "react";
import axios from 'axios';

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext= createContext();

export const UserProvider=({children})=>{

  const [user,setUser]= useState(null);
  const token= localStorage.getItem("token");

  // Fetch user profile.
  const fetchUserProfile= async ()=>{
    if(!token){
      setUser(null);
      return;
    }

    try{
      const res= await axios.get(`${import.meta.env.VITE_API_URL}/api/user/profile`,{
        headers:{
          Authorization: `Bearer ${token}`
        },
      });
      setUser(res.data);
    }catch(err){
      console.error("User fetch failed:", err);
      setUser(null);
    }
    
  };
    useEffect(() => {
      fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);
  
    const refreshUser = () => {
    fetchUserProfile();
  };

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}