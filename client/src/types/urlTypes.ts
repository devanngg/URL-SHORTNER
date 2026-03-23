export interface UrlShortenRequest{
    originalUrl:string;
}
export interface UrlShortenResponse{
    shortUrl:string,
    code:string
}
export interface UrlStats{
     originalUrl:string,
     shortCode:string,
     clickCount:number,
     createdAt:string,
     lastAccessedAt:string|null;
}