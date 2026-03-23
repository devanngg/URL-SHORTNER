import { UrlShortenRequest, UrlShortenResponse } from "@/types/urlTypes";
import api from "../../../api/axios";


export const shortenUrl = async(data:UrlShortenRequest) : Promise<UrlShortenResponse>=>{
const response = await api.post<UrlShortenResponse>("/urls/",data);
return response.data;
}
