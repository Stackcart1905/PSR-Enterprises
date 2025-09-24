import { AwardIcon, LogOut } from "lucide-react";
import api from "../lib/axios.js" ; 

import {create} from "zustand" ; 

import {persist} from "zustand" ; 


const useAuthStore= create((set , get) => ({
    // state 
    user : null , 
    isAuthenticated : false , 
    isLoading : false , 
    error : null , 

    // actions or funcitons 

    setUser : (userData) => set({
        user : userData , 
        isAuthenticated : !!userData , 
        error : null , 
    }) , 

    setLoading :(loading) => set({isLoading : loading}) , 

    setError : (error) => set({error}) , 


    login : async (email , password ) => {
        set({isLoading : true , error : null}) ; 

        try {
            const response = await api.post("/api/auth/signin" , {email , password}) ; 

            set({
                user : response.data , 
                isAuthenticated : true , 
                error : null ,  
            }) ; 

            return response.data ; 

        } catch (error) {
            
            const message = error.response?.data?.message || "Login Failed"; 

            set({error : message}) ; 

            throw new Error(message) ; 
        } finally {
            set({isLoading : false}) ; 
        }
    } , 
    

    signup : async (userData) => {
        set({isLoading : true , error : null})  ; 

        try {
          const response = await api.post("./api/auth/signup" , userData) ; 

          return response.data ;

        } catch (error) {
           const message = error.response?.data?.message || "Signup Failed"   ; 

           set({error : message}) ; 

           throw new Error(message) ; 
        }
        finally {
            set({isLoading : false}) ; 
        }
    } , 

    verifyOtp : async (email , otp) => {
        set({isLoading : true , error : null}) ; 

        try {
            const response = await api.post("/api/auth/verify-otp" , {email , otp}) ; 

            set({
                user : response.data , 
                isAuthenticated : true , 
                error : null , 
            }) ;
            return response.data ;
        } catch (error) {
            const message = error.response?.data?.message || "OTP verification failed"  ; 

            set({error : message}) ; 

            throw new Error(message) ; 
        } finally {
            set({isLoading : false}) ; 
        }
    } , 

    resendOtp : async (email) => {
        set({isLoading : true , error : null}) ; 

        try {
            const response = await api.post("/api/auth/resend-otp" , {email}) ; 
            return response.data ; 

        } catch (error) {
            const message = error.response?.data?.message || "Failed to resend Otp"  ; 
            set({error : message}) ; 
        } finally {
            set({isLoading : false}) ; 
        } 
    } , 

    logout : async() => {
        set({isLoading : true}) ; 
        try {
            await api.post("./api/auth/logout");
        } catch (error) {
            console.error("Logout error" ,error) ; 
        } finally {
            set({
                user : null , 
                isAuthenticated : false , 
                isLoading : false , 
            }) ; 
        }
    } ,

    checkAuth : async() => {
        set({isLoading : true})  ; 
        try {
            const response = await api.get("/api/auth/checkAuth") ; 

            set({
                user : response.data.user , 
                isAuthenticated : true , 
            }) ; 
            return response.data.user ; 
        } catch (error) {
            set({user : null , isAuthenticated : false}) ; 
            return null ; 
        } finally {
            set({isLoading : false}) ; 
        }
    } , 

    forgetPassword : async(email) => {
        set({isLoading : true , error : null}) ; 
        try {
            const response = await api.post("/api/auth/forgetPassword" , {email}) ; 
            return response.data ; 
        } catch(error) {
            const message = error.response?.data?.message || "Password reset failed" ; 
            set({error : message}) ; 
            throw new Error(message) ; 
        } finally {
            set({isLoading : false}) ; 
        }
    } , 

    resetPassword : async(email , otp , newPassword) => {
        set({isLoading : true , error : null}) ; 
        try {
            const response = await api.post("/api/auth/resetPassword" , {
                email , otp , newPassword
            }) ; 

            set({
                user : response.data , 
                isAuthenticated : true , 
                error : null , 
            }) ; 

            return response.data ; 
        } catch (error) {
            const message = error.response?.data?.message || "Password reset failed" ; 
            set({error : message}) ; 
        } finally {
            set({isLoading : false}) ; 
        }
    } , 
     
    clearError : () => set({error: null}) ,

}))

export default useAuthStore ; 