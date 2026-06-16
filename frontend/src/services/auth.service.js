import api from "../utils/api";

export const login = async (data) => {
  try {
    const res = await api.post("/auth/login", data);
    localStorage.setItem("token", res.data.activeToken);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error.response?.data || { message: "Unable to connect to server" };
  }
};

export const register = async (data) => {
  try {
    const res = await api.post("/auth/register", data)
    return res.data
  }
  catch (err) {
    throw err.response?.data || { message: "Unable to connect to server" }
  }
}

export const getMeApi=async()=>{
  try {
    const res = await api.get("/user/me");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Unable to connect to server" };
  }
};


export const forgetPasswordApi=async(email)=>{
    try {
         const res=await api.post("/auth/forget-password",email)
        return res.data
    }
    catch (err) {
        throw err.response?.data || { message: "Unable to connect to server" }
    }
}



export const resetPasswordApi=async(data)=>{
  console.log(data)
  try {
    
    const res=await api.post("/auth/reset-password",data)
    return res.data
  }
  catch (err) {
    throw err.response?.data || { message: "Unable to connect to server" }
  }
}


export const logoutApi=async()=>{
  try {
    const res = await api.post("/auth/logout");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Unable to connect to server" };
  }
};