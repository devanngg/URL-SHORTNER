// What does this do overall 
// 1. Takes a long Url 
// 2. Sends it to your backend shortenUrl\
// 3. Stores the shorten url link ]
// 4. Handles the loading and the error state

import { UrlShortenResponse } from "@/types/urlTypes";
import { createSlice,createAsyncThunk} from "@reduxjs/toolkit";
import { shortenUrl} from "../features/url-shortener/services/urlService"

interface UrlState {
    result : UrlShortenResponse| null;  // stroes the api response
    loading : boolean;  // tells ui if the request is still in prgress or not
    error : string| null; //  stores the error message if somethiig fails
}

const initialState : UrlState = {
    result : null,
    loading: false,
    error: null
}

// Thunk which will handle the api calls 
// Async ThUNK  HADLES THE ASYNC API CALLS AND AUTO MATICALLY GENRATES 3STATES 
// PENDINGF
// FULFILLED
// REJECTED 

export const shortenUrlAsync = createAsyncThunk (
"url/shorten",
async (originalUrl: string,{rejectWithValue})=>{
    try {
        const response = await shortenUrl({originalUrl}); //  calls the api function sends originalUrl as payload 
        return response;
    }
    catch (err:any){
        return rejectWithValue(err.response?.data||"Failed to shorten Url");
    }
}
);


const urlSlice = createSlice({
    name:"urlShortner",
    initialState,
    reducers:{
        resetUrl : (state)=>{
            state.result =null;
            state.error = null;
        }
    },
    extraReducers:(builder:any)=>{
        builder
        .addCase(shortenUrlAsync.pending,(state:any)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(shortenUrlAsync.fulfilled,(state:any,action:any)=>{
            state.loading=false;
            state.result = action.payload;
        })
        .addCase(shortenUrlAsync.rejected,(state:any,action:any)=>{
            state.loading = false;
            state.error = action.payload as string
        })
    }
});

export const {resetUrl} = urlSlice.actions;
export default urlSlice.reducer;
